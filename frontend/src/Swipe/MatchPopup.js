import React from "react";
import { useNavigate } from "react-router-dom";
import "./Swipe.css";

const MatchPopup = ({ visible, userName, userProfilePic, userId, onClose }) => {
  const navigate = useNavigate();

  if (!visible) return null;

  const handleSendMessage = () => {
    onClose(); // Close the popup
    if (userId) {
      navigate(`/messages/`); // Navigate to the message page with the user's ID
    } else {
      console.error("Error: userId is undefined");
    }
  };

  return (
    <div className="match-popup-overlay">
      <div className="match-popup">
        <div className="heart-animation"></div> {/* Heart animation */}
        <div className="profile-pic-matchPopup">
          <img className="profile-pic-matchPopup-img" src={userProfilePic} alt={`${userName}'s profile`} />
        </div>
        <p className="match-text">
          You matched with <strong>{userName}!</strong> {/* Bold userName */}
        </p>
        <div className="popup-buttons">
          <button className="message-btn" onClick={handleSendMessage}>
            Message
          </button>
          <button className="close-btn" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchPopup;
