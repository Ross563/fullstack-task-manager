import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function Header() {
  const { setIsAuthenticated, setCurrUser, currUser } = useContext(AuthContext);

  const [profilePic, setProfilePic] = useState(null);

  async function handleLogout() {
    try {
      const response = await axios.get("/logout");
      setIsAuthenticated(false);
      setCurrUser(null);
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  }

  useEffect(() => {
    async function initialLoad() {
      try {
        const formData = new FormData();
        const { data: updatedUser } = await axios.post("/profile", formData);
        setCurrUser(updatedUser);
      } catch (error) {
        console.log(error);
        alert("App loading failed. Please try again.");
      }
    }
    initialLoad();
  }, []);

  useEffect(() => {
    setProfilePic(currUser?.profilePic);
  }, [currUser]);

  return (
    <header className="bg-blue-500 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold">
          <Link to="/">Task Manager</Link>
        </h1>

        {/* Navigation Links */}
        <nav className="space-x-4 flex items-center">
          <Link
            to="/tasks"
            className="hover:text-gray-200 transition duration-300"
          >
            Tasks
          </Link>

          <Link
            to="/about"
            className="hover:text-gray-200 transition duration-300"
          >
            About
          </Link>
          <Link
            to="/login"
            className="hover:text-gray-200 transition duration-300"
            onClick={handleLogout}
          >
            Logout
          </Link>

          {/* Profile Picture or Icon */}
          <Link to="/profile" className="ml-4">
            {profilePic ? (
              <img
                src={
                  profilePic
                    ? profilePic
                    : "https://www.bing.com/images/search?view=detailV2&ccid=CNIPJOPW&id=2B385A64897D84BEFA2C3E63785931CB428992C1&thid=OIP.CNIPJOPWQ1tiTLX1WxEx3QHaH_&mediaurl=https%3a%2f%2fcdn2.vectorstock.com%2fi%2f1000x1000%2f17%2f61%2fmale-avatar-profile-picture-vector-10211761.jpg&exph=1080&expw=1000&q=profile+pic+avatar&simid=608004028150063683&FORM=IRPRST&ck=1E07E56C7D88620F5026D528B68226CF&selectedIndex=0&itb=0"
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <FaUserCircle className="text-3xl" />
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
