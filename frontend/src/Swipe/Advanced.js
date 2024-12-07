import React, { useState, useMemo, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { FaTimes, FaUndo, FaHeart, FaRedo } from "react-icons/fa";
import MatchPopup from "./MatchPopup";
import "./Swipe.css";

const defaultProfilePicture = "https://via.placeholder.com/150";

function Advanced() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchUserName, setMatchUserName] = useState("");
  const [matchUserProfilePic, setMatchUserProfilePic] = useState("");
  const [matchUserId, setMatchUserId] = useState("");

  const API_URL = process.env.REACT_APP_API_URL; // Environment variable for the base API URL

  const childRefs = useMemo(() => users.map(() => React.createRef()), [users]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/auth/all-users?page=1&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
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
            bio: user.bio || "No bio available",
          }))
        );
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUsers();
  }, [API_URL]);

  const loadMoreUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const page = Math.floor(swipeCount / 10) + 1;
      const response = await fetch(`${API_URL}/api/auth/all-users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch more users.");
      }

      const userData = await response.json();
      setUsers((prevUsers) => [
        ...prevUsers,
        ...userData.map((user) => ({
          id: user._id || `${user.name}-${Math.random()}`,
          name: user.name || "Anonymous",
          url: user.profilePicture || defaultProfilePicture,
          gender: user.gender || "Not specified",
          bio: user.bio || "No bio available",
        })),
      ]);
    } catch (err) {
      console.error("Error loading more users:", err);
    }
  };

  const swiped = async (direction, targetUserName, index) => {
    setSwipeCount((prevCount) => prevCount + 1);

    const token = localStorage.getItem("token");
    const targetUserId = users[index]?.id;

    if (!token || !targetUserId || !direction) {
      console.error("Error: Missing required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId, direction }),
      });

      const data = await response.json();
      if (data.mutual) {
        setMatchUserName(targetUserName);
        setMatchUserProfilePic(users[index].url);
        setMatchUserId(targetUserId);
        setShowMatchPopup(true);
      }
    } catch (err) {
      console.error("Error sending swipe action:", err);
    }

    setCurrentIndex((prevIndex) => prevIndex - 1);

    if (swipeCount >= 9) {
      loadMoreUsers();
      setSwipeCount(0);
    }
  };

  const swipe = async (dir) => {
    if (currentIndex < users.length) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const goBack = async () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      await childRefs[currentIndex + 1].current.restoreCard();
    }
  };

  const refreshUsers = () => {
    setSwipeCount(0);
    loadMoreUsers();
  };

  return (
    <div id="swipe-root">
      <div className="dynamic-island">
        <span className="dynamic-text">Amity</span>
      </div>
      <br />
      {users.length === 0 ? null : (
        <>
          <MatchPopup
            visible={showMatchPopup}
            userName={matchUserName}
            userProfilePic={matchUserProfilePic}
            userId={matchUserId}
            onClose={() => setShowMatchPopup(false)}
          />
          <div className="cardContainer">
            {users.map((user, index) => (
              <TinderCard
                ref={childRefs[index]}
                className="swipe"
                key={`${user.id || `user-${index}`}-${user.url || defaultProfilePicture}`}
                onSwipe={(dir) => swiped(dir, user.name, index)}
                onCardLeftScreen={() => {}}
              >
                <div
                  style={{ backgroundImage: `url(${user.url || defaultProfilePicture})` }}
                  className="card"
                >
                  <h3>
                    {user.name} {user.gender.charAt(0)}
                  </h3>
                  <div className="bio-overlay">
                    <p>{user.bio}</p>
                  </div>
                </div>
              </TinderCard>
            ))}
          </div>

          <div className="buttons">
            <button onClick={() => swipe("left")}>
              <FaTimes />
            </button>
            <button onClick={goBack}>
              <FaUndo />
            </button>
            <button onClick={() => swipe("right")}>
              <FaHeart />
            </button>
          </div>

          {swipeCount >= 10 && (
            <div className="refresh-button">
              <button onClick={refreshUsers}>
                <FaRedo /> Refresh
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Advanced;
