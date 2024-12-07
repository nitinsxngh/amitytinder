import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./ProfileCard.css";

const ProfileCard = () => {
  const [user, setUser] = useState(null); 
  const [bio, setBio] = useState(""); 
  const [isEditing, setIsEditing] = useState(false); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); 
  const [imageUrl, setImageUrl] = useState(null); // To hold the profile image URL
  const [selectedImage, setSelectedImage] = useState(null); // To show a preview of the selected image
  const navigate = useNavigate(); 

  const API_URL = process.env.REACT_APP_API_URL; // Use environment variable for API URL

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }
    
      try {
        const response = await fetch(`${API_URL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch user data.");
        }
    
        const userData = await response.json();
        if (!userData) {
          throw new Error("User data not found.");
        }
    
        setUser(userData); 
        setBio(userData.bio || ""); 
        setImageUrl(userData.profilePicture || null);  // Use profilePicture if available
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "An error occurred.");
      }
    };
    
    fetchUser();
  }, []); // Empty dependency array to fetch user data on initial mount

  const handleSaveBio = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update bio.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser); 
      setIsEditing(false); 
      setSuccess(true); 
      setTimeout(() => setSuccess(false), 3000); 
    } catch (err) {
      console.error("Error updating bio:", err);
      setError(err.message || "An error occurred.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login"); 
  };

  const handleImageChange = async (e) => {
    const formData = new FormData();
    formData.append('profileImage', e.target.files[0]);
  
    const token = localStorage.getItem('token'); // Correctly retrieve the token
  
    try {
      const response = await fetch(`${API_URL}/api/auth/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error);
  
      console.log('Image uploaded:', data);
  
      // Set the new image URL after a successful upload
      setImageUrl(data.profileImage); // Assuming the response contains the uploaded image URL
      setSelectedImage(URL.createObjectURL(e.target.files[0])); // Show preview of uploaded image
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };
  

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="card-container">
      <div className="profile-image-container">
        <img
          className="profile-image"
          src={selectedImage || imageUrl || user.profilePicture || "https://via.placeholder.com/150"} 
          alt="Profile"
        />
        <label htmlFor="image-upload" className="image-upload-btn">
          <span className="upload-btn">Upload Image</span>
        </label>
        <input
          type="file"
          id="image-upload"
          className="image-upload-input"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </div>
      <div className="profile-details">
        <div className="name-age">
          <h2 className="name">{user.name || "John Doe"}</h2>
          {user.dob && (
            <span className="age">{calculateAge(user.dob)} years</span>
          )}
        </div>
        <p className="detail">
          <strong>Gender:</strong> {user.gender || "Not specified"}
        </p>
        <p className="detail">
          <strong>Interested In:</strong> {user.interestedIn || "Not specified"}
        </p>
        <p className="detail">
          <strong>University:</strong> {user.university || "Not specified"}
        </p>
        <div className="bio-container">
          <strong>Bio:</strong>{" "}
          {isEditing ? (
            <textarea
              className="edit-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          ) : (
            <span>{user.bio || "No bio available"}</span>
          )}
        </div>
        {isEditing ? (
          <div className="button-group">
            <button className="save-btn" onClick={handleSaveBio}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Bio
          </button>
        )}
        {success && <div className="success-message">Bio updated successfully!</div>}
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

// Helper to calculate age
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default ProfileCard;
