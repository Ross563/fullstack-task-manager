import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function ProfilePage() {
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { currUser, setCurrUser } = useContext(AuthContext);

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

// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";

// function ProfilePage() {
//   const { profilePic, setProfilePic } = useContext(AuthContext); // Use context to get and update profilePic
//   const [selectedFile, setSelectedFile] = useState(null);

//   async function uploadImg() {
//     try {
//       const { data: updatedUser } = await axios.post("/profile", {
//         image: profilePic,
//       });
//       setProfilePic(updatedUser.profilePic);
//     } catch (error) {
//       alert("Couldn't upload. Please try again.");
//     }
//   }

//   // Handle file upload and update profilePic
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfilePic(reader.result); // Update profilePic state with base64 string
//       };
//       reader.readAsDataURL(file);
//       setSelectedFile(file.name);
//     }
//   };
//   useEffect(() => {
//     if (profilePic) {
//       uploadImg();
//     }
//   }, [profilePic]);
//   return (
//     <div className="container mx-auto p-6">
//       <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
//         {/* Welcome Message */}
//         <h1 className="text-2xl font-bold mb-4">Welcome to Your Profile!</h1>

//         {/* Display Current Profile Picture */}
//         <div className="flex flex-col items-center mb-6">
//           {profilePic ? (
//             <img
//               src={profilePic}
//               alt="Profile"
//               className="w-32 h-32 rounded-full border-2 border-blue-500 shadow-md"
//             />
//           ) : (
//             <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
//               No Profile Picture
//             </div>
//           )}
//         </div>

//         {/* Upload Profile Picture */}
//         <div className="mb-6">
//           <label
//             htmlFor="profilePic"
//             className="block text-sm font-medium text-gray-700 mb-2"
//           >
//             Upload Profile Picture
//           </label>
//           <input
//             type="file"
//             id="profilePic"
//             accept="image/*"
//             className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer"
//             onChange={handleFileUpload}
//           />
//           {selectedFile && (
//             <p className="text-sm text-green-500 mt-2">
//               Uploaded: {selectedFile}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;
