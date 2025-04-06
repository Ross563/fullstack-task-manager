import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function ProfilePage() {
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { currUser, setCurrUser, isAuthenticated } = useContext(AuthContext);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePic", file); // Key matches the Multer `upload.single("profilePic")`
      try {
        const { data: updatedUser } = await axios.post("/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCurrUser(updatedUser);

        setSelectedFile(file.name);
      } catch (error) {
        console.log(error);
        alert("Image upload failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      async function initialLoad() {
        try {
          const formData = new FormData();
          const { data: updatedUser } = await axios.post("/profile", formData);
          setCurrUser(updatedUser);
          // Update the profilePic state with the new URL
        } catch (error) {
          console.log(error);
          alert("Image loading failed. Please try again.");
        }
      }
      initialLoad();
    }
  }, []);

  useEffect(() => {
    setProfilePic(currUser?.profilePic);
  }, [currUser]);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Welcome {currUser ? currUser.name : "to your Profile"} !
        </h1>

        <div className="flex flex-col items-center mb-6">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full border-2 border-blue-500 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
              <h3 className="ml-5">No Profile Picture</h3>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="profilePic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {currUser ? "Update Your" : "Upload"} Profile Picture
          </label>
          <input
            type="file"
            id="profilePic"
            accept="image/*"
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer"
            onChange={handleFileUpload}
          />
          {selectedFile && (
            <p className="text-sm text-green-500 mt-2">
              Uploaded: {selectedFile}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
