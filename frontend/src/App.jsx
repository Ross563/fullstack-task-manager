import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import TaskManager from "./pages/TaskManager";
import Header from "./components/Header";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("/testing")
      .then((response) => {
        setIsAuthenticated(response.data);
      })
      .catch((error) => {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/tasks"
          element={isAuthenticated ? <TaskManager /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
