const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./models/db");
const User = require("./models/userModel");
const TaskModel = require("./models/taskModel");
const PORT = process.env.PORT || 8080;
const jwtSecret = process.env.JwtSecret;
const bodyParser = require("body-parser");
const cors = require("cors");
const UserModel = require("./models/userModel");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { Readable } = require("stream");

app.use(
  cors({
    credentials: true,
    origin: process.env.frontend_base_url,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function IsLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.json("you are not logged in...");
  else {
    let data = jwt.verify(req.cookies.token, jwtSecret);
    req.userDataFromCookie = data;
  }
  next();
}

const storage = multer.memoryStorage(); // Store file temporarily in memory
const upload = multer({ storage });

app.post(
  "/profile",
  IsLoggedIn,
  upload.single("profilePic"),
  async (req, res) => {
    const userID = req.userDataFromCookie.id; // User ID from auth middleware

    try {
      if (!req.file) {
        const updatedUser = await User.findById(userID);
        res.json(updatedUser);
        return;
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "mini-task-manager",
        },
        async (error, result) => {
          if (error) {
            console.error(error);
            res.status(500).json({ error: "Image upload failed" });
          } else {
            const updatedUser = await UserModel.findByIdAndUpdate(
              userID,
              { profilePic: result.secure_url },
              { new: true }
            );
            res.json(updatedUser);
          }
        }
      );
      const stream = Readable.from(req.file.buffer);
      stream.pipe(uploadStream);
    } catch (error) {
      console.error("User profile pic upload error:", error);
      res.status(422).json({ error: "Upload failed. Please try again." });
    }
  }
);

app.get("/", (req, res) => {
  res.status(200).send("Hello from the server");
});

app.get("/logout", (req, res) => {
  try {
    res
      .cookie("token", "", { sameSite: "None", secure: true })
      .json({ log: "true" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/testing", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json(false);
    }

    jwt.verify(token, jwtSecret);
    res.json(true);
  } catch (e) {
    console.log(e);
    res.json(false);
  }
});

app.get("/tasks", IsLoggedIn, async (req, res) => {
  try {
    const userID = req.userDataFromCookie.id;

    const user = await UserModel.findById(userID).populate("tasks");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/tasks", IsLoggedIn, async (req, res) => {
  const { taskName, isDone } = req.body;

  const userEmail = req.userDataFromCookie.email;
  const userID = req.userDataFromCookie.id;

  try {
    let user = await UserModel.findOne({ email: userEmail });
    const taskDoc = await TaskModel.create({
      taskName,
      isDone,
      user: userID,
    });
    user.tasks.push(taskDoc._id);
    await user.save();
    res.json(taskDoc);
  } catch (e) {
    console.error("User registration error:", e);
    res.status(422).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/tasks/delete", IsLoggedIn, async (req, res) => {
  const { id } = req.body;

  const userID = req.userDataFromCookie.id;

  try {
    let user = await UserModel.findById(userID);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.tasks = user.tasks.filter((taskId) => taskId.toString() !== id);

    await user.save();

    await TaskModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/tasks/update", IsLoggedIn, async (req, res) => {
  const { id, taskName, isDone } = req.body;

  try {
    let updatedTask;
    if (!taskName.trim()) {
      Task = await TaskModel.findByIdAndUpdate(id, { isDone }, { new: true });
    } else {
      Task = await TaskModel.findByIdAndUpdate(id, { taskName }, { new: true });
    }

    res.json(Task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(422).json({ error: "Email or password is incorrect" });
    }

    const isPasswordOk = bcrypt.compareSync(password, userDoc.password);

    if (!isPasswordOk) {
      return res.status(422).json({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      {
        email: userDoc.email,
        id: userDoc._id,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, { sameSite: "None", secure: true })
      .json(userDoc);
  } catch (error) {
    console.error("Login error:", error);
    res.status(501).json({ error: "Something went wrong. Please try again." });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const encryptedPW = await bcrypt.hash(password, salt);

    const userDoc = await User.create({
      name,
      email,
      password: encryptedPW,
    });
    const token = jwt.sign(
      {
        email: userDoc.email,
        id: userDoc._id,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, { sameSite: "None", secure: true })
      .json(userDoc);
  } catch (e) {
    console.error("User registration error:", e);
    res.status(422).json({ error: "Registration failed. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT=${PORT}`);
});
