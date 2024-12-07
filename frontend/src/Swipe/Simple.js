import React, { useState, useMemo, useRef, useEffect } from "react";
import TinderCard from "react-tinder-card";
import MatchPopup from "./MatchPopup"; // Import MatchPopup
import "./Swipe.css"; // Import the CSS file

const defaultProfilePicture = "https://via.placeholder.com/150"; // Default image URL

function Simple() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchUserName, setMatchUserName] = useState("");
  const currentIndexRef = useRef(currentIndex);

  const API_URL = process.env.REACT_APP_API_URL; // Using environment variable

  const childRefs = useMemo(
    () =>
      Array(users.length)
        .fill(0)
        .map(() => React.createRef()),
    [users]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User is not authenticated.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch users.");
        }

        const userData = await response.json();
        setUsers(
          userData.map((user) => ({
            id: user._id || `${user.name}-${Math.random()}`,
            name: user.name || "Anonymous",
            url: user.profilePicture || defaultProfilePicture,
            gender: user.gender || "Not specified",
            bio: user.bio || "No bio available.", // Adding bio field
          }))
        );
        setCurrentIndex(userData.length - 1);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUsers();
  }, [API_URL]);

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const swiped = async (direction, targetUserName, index) => {
    try {
      const token = localStorage.getItem("token");
      const targetUserId = users[index]?.id;

      if (token && targetUserId) {
        const response = await fetch(`${API_URL}/api/auth/swipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId, direction }),
        });

        const data = await response.json();
        if (data.mutual) {
          setMatchUserName(targetUserName);
          setShowMatchPopup(true);
        }
      }
    } catch (err) {
      console.error("Error sending swipe action:", err);
    }

    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
  };

  // Return nothing if there are no users
  if (users.length === 0) {
    return <h1>Amity Tinder</h1>;
  }

  return (
    <div id="swipe-root">
      {/* Dynamic Island-like Container for the "Likes" label */}
      <div className="dynamic-island">
        <span className="dynamic-text">Amity</span>
      </div>
      <br />
      <br />

      {/* Match Popup */}
      <MatchPopup
        visible={showMatchPopup}
        userName={matchUserName}
        onClose={() => setShowMatchPopup(false)}
      />

      <div className="cardContainer">
        {users.map((user, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="swipe"
            key={user.id}
            onSwipe={(dir) => swiped(dir, user.name, index)}
            onCardLeftScreen={() => outOfFrame(user.name, index)}
          >
            <div
              style={{ backgroundImage: `url(${user.url})` }}
              className="card"
            >
              <h3>{user.name} {user.gender.charAt(0)}</h3>
              <div className="bio-overlay">
                <p>{user.bio}</p>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>
    </div>
  );
}

export default Simple;
