import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MatchesList.css";

const defaultProfilePicture = "https://via.placeholder.com/150"; // Default profile picture

function MatchesList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [pinnedMatches, setPinnedMatches] = useState([]); // New state for pinned matches
  const navigate = useNavigate(); // Initialize useNavigate
  const currentUserId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage

  const apiUrl = process.env.REACT_APP_API_URL; // Get API URL from .env

  // Use useEffect to fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      console.log("Fetching matches...");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/auth/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch matches.");
        }

        const matchData = await response.json();
        console.log("Raw match data:", matchData);

        // Process the match data to include the last message details
        const formattedMatches = matchData.map((match) => {
          const lastMessage = match.lastMessage || {};

          return {
            id: match._id,
            name: match.name || "Anonymous",
            profilePicture: match.profilePicture || defaultProfilePicture,
            lastMessageContent: lastMessage.content || "No messages",
            lastMessageSenderId: lastMessage.sender || null,
            lastMessageAt: lastMessage.createdAt ? new Date(lastMessage.createdAt) : null,
          };
        });

        setMatches(formattedMatches);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred.");
        setLoading(false);
        console.error("Error fetching matches:", err);
      }
    };

    fetchMatches();
  }, [apiUrl]);

  // Handle pinning/unpinning a match
  const togglePin = async (matchId, targetUserId) => {
    if (!targetUserId) {
      console.error("Target user ID is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/auth/pin-match`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, targetUserId }), // Send the correct targetUserId
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        setPinnedMatches((prevPinnedMatches) => {
          if (data.pinnedMatches.includes(matchId)) {
            return [...prevPinnedMatches, matchId]; // Add to pinned matches
          } else {
            return prevPinnedMatches.filter((id) => id !== matchId); // Remove from pinned matches
          }
        });
      } else {
        console.error(data.error || "Failed to pin/unpin match");
      }
    } catch (err) {
      console.error("Error pinning/unpinning match:", err);
    }
  };

  // Sort matches so that pinned ones are at the top and unpinned ones are sorted by last message date
  const sortedMatches = matches
    .filter((match) => pinnedMatches.includes(match.id) || !pinnedMatches.includes(match.id)) // Filter by pinned state
    .sort((a, b) => {
      // Pinned matches should appear at the top
      if (pinnedMatches.includes(a.id) && !pinnedMatches.includes(b.id)) {
        return -1; // a comes first
      } else if (!pinnedMatches.includes(a.id) && pinnedMatches.includes(b.id)) {
        return 1; // b comes first
      }

      // If both are pinned or both are unpinned, sort by last message date
      const aDate = a.lastMessageAt || new Date(0);
      const bDate = b.lastMessageAt || new Date(0);
      return bDate - aDate; // Most recent first
    });

  // Handle starting a chat
  const handleStartChat = (targetUserId, match) => {
    const token = localStorage.getItem("token");

    fetch(`${apiUrl}/api/chat/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    })
      .then((response) => response.json())
      .then((data) => {
        navigate(`/messages/${data.chat._id}`, { state: { match } }); // Pass match data here
      })
      .catch((err) => {
        console.error("Error starting chat:", err);
        setError(err.message || "Failed to start chat.");
      });
  };

  // Format the timestamp into a readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "numeric", // Numeric day (e.g., "9")
      month: "short", // Abbreviated month (e.g., "Oct")
      hour: "numeric", // Hour in numeric format (e.g., "6")
      minute: "numeric", // Minute in numeric format (e.g., "25")
      hour12: true, // Use 12-hour clock (e.g., "AM"/"PM")
    });
  };

  // If still loading, show the loading state
  if (loading) {
    return <div className="loading">Loading matches...</div>;
  }

  // If there is an error, show the error message
  if (error) {
    return <div className="error">{error}</div>;
  }

  // If no matches found, show a custom message
  if (matches.length === 0) {
    return (
      <div className="no-matches">
        <img src="img/7.png" alt="No matches" className="no-matches-image" />
        <p>No matches yet. Start swiping!</p>
      </div>
    );
  }

  // Render the matches
  return (
    <div className="matches-container">
      <h1>Matches</h1>
      <div className="matches-list">
        {sortedMatches.map((match) => {
          return (
            <div
              key={match.id}
              className="match-card"
              onClick={() => handleStartChat(match.id, match)} // Handle chat start on card click
            >
              <img
                src={match.profilePicture}
                alt={`${match.name}'s profile`}
                className="match-image"
              />
              <div className="match-info">
                <p className="match-name">{match.name}</p>
                <div className="message-container">
                  <p className="last-message">
                    {match.lastMessageSenderId === currentUserId
                      ? `You: ${
                          match.lastMessageContent && match.lastMessageContent.length > 10
                            ? match.lastMessageContent.substring(0, 10) + "..."
                            : match.lastMessageContent
                        }`
                      : `${match.lastMessageContent && match.lastMessageContent.length > 10
                          ? match.lastMessageContent.substring(0, 10) + "..."
                          : match.lastMessageContent}`}
                  </p>
                  {match.lastMessageAt && (
                    <p className="last-message-timestamp">
                      {formatTimestamp(match.lastMessageAt)}
                    </p>
                  )}
                </div>
                <button
                  className="pin-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering chat start
                    if (match.id) { // Use match.id instead of currentUserId
                      togglePin(match.id, match.id); // Pass match.id here
                    } else {
                      console.error("No match ID found for this match");
                    }
                  }}
                >
                  {pinnedMatches.includes(match.id) ? "Unpin" : "Pin"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MatchesList;
