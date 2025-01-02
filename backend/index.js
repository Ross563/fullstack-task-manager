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
    res.cookie("token", "").json({ log: "true" });
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

    res.json(user);
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

    res.cookie("token", token).json(userDoc);
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

    res.cookie("token", token).json(userDoc);
  } catch (e) {
    console.error("User registration error:", e);
    res.status(422).json({ error: "Registration failed. Please try again." });
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT=${PORT}`);
});

// const express = require("express");
// const app = express();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// require("dotenv").config();
// require("./models/db");
// const UserModel = require("./models/userModel");
// const TaskModel = require("./models/taskModel");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const PORT = process.env.PORT || 8080;
// const jwtSecret = process.env.JwtSecret;

// app.use(
//   cors({
//     credentials: true,
//     origin: "http://localhost:3000", // Adjust for your frontend URL
//   })
// );
// app.use(bodyParser.json());
// app.use(cookieParser());

// // Middleware for Authentication
// function IsLoggedIn(req, res, next) {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ error: "You are not logged in" });
//   }

//   try {
//     const data = jwt.verify(token, jwtSecret);
//     req.userDataFromCookie = data;
//     next();
//   } catch (error) {
//     console.error("Invalid token:", error);
//     res.status(403).json({ error: "Invalid or expired token" });
//   }
// }

// // Root Route
// app.get("/", (req, res) => {
//   res.send("Hello from the server");
// });

// // Test Route
// app.get("/testing", (req, res) => {
//   const token = req.cookies.token;

//   try {
//     if (!token) {
//       return res.json(false);
//     }

//     jwt.verify(token, jwtSecret);
//     res.json(true);
//   } catch (error) {
//     res.json(false);
//   }
// });

// // Fetch Tasks
// app.get("/tasks", IsLoggedIn, async (req, res) => {
//   try {
//     const userID = req.userDataFromCookie.id;
//     const user = await UserModel.findById(userID).populate("tasks");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({ tasks: user.tasks });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Create a Task
// app.post("/tasks", IsLoggedIn, async (req, res) => {
//   const { taskName, isDone } = req.body;

//   if (!taskName) {
//     return res.status(400).json({ error: "Task name is required" });
//   }

//   try {
//     const userID = req.userDataFromCookie.id;

//     const newTask = await TaskModel.create({
//       taskName,
//       isDone: isDone || false,
//       user: userID,
//     });

//     const user = await UserModel.findById(userID);
//     user.tasks.push(newTask._id);
//     await user.save();

//     res.status(201).json(newTask);
//   } catch (error) {
//     console.error("Error creating task:", error);
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// // Login Route
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const user = await UserModel.findOne({ email });

//     if (!user || !bcrypt.compareSync(password, user.password)) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const token = jwt.sign({ email: user.email, id: user._id }, jwtSecret, {
//       expiresIn: "7d",
//     });

//     res.cookie("token", token, { httpOnly: true }).json(user);
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Login failed" });
//   }
// });

// // Register Route
// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await UserModel.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json(newUser);
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// // Logout Route
// app.get("/logout", (req, res) => {
//   res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
//   res.json({ message: "Logged out successfully" });
// });

// // Start the Server
// app.listen(PORT, () => {
//   console.log(`Server is running on PORT=${PORT}`);
// });
