import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import "./Chat.css";

function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Access state passed via navigate
  const match = location.state?.match || {}; // Extract match data from state

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null); // Reference to the bottom of the messages

  useEffect(() => {
    if (!currentUserId) {
      console.warn("User not authenticated. Redirecting to login...");
      navigate("/login");
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/messages/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch messages.");
        }

        setMessages(data.messages);
        setLoading(false);
        scrollToBottom(); // Scroll to bottom after loading messages
      } catch (err) {
        setError(err.message || "An error occurred.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messages change
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("token");
    const tempMessage = {
      sender: { _id: currentUserId, name: "You" }, // Use local data for immediate update
      content: newMessage,
      createdAt: Date.now(),
    };

    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage(""); // Clear input

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${matchId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message.");
      }

      // Refresh messages after successful send
      const updatedMessages = await fetchMessages();
      setMessages(updatedMessages);
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/messages/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      return data.messages;
    }
    throw new Error(data.error || "Failed to fetch messages.");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format timestamp to match the format used in MatchesList
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (loading) return <div>Loading chat...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FontAwesomeIcon
          icon={faChevronLeft}
          onClick={handleGoBack}
          className="go-back-icon"
        />
        <div className="profile-info">
          <img
            src={match.profilePicture || "https://via.placeholder.com/50"}
            alt={`${match.name || "User"}'s profile`}
            className="profile-picture"
          />
          <h3>{match.name || "Anonymous User"}</h3>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => {
          const senderId = message?.sender?._id || "unknown";
          const senderName = message?.sender?.name || "Unknown User";
          const timestamp = formatTimestamp(message?.createdAt);

          const isCurrentUser = senderId === currentUserId;

          return (
            <div
              key={index}
              className={`chat-message ${
                isCurrentUser ? "chat-my-message" : "chat-their-message"
              }`}
            >
              <p className="chat-message-content">{message.content}</p>
              <span className="chat-message-sender">
                {isCurrentUser ? "You" : senderName}
              </span>
              <span className="chat-message-timestamp">{timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div> {/* Empty div to scroll into view */}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input-field"
        />
        <button onClick={handleSendMessage} className="chat-input-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
