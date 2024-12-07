import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL; // Get API URL from .env

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Start loading

    // Basic client-side email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, { // Use the apiUrl from .env
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to localStorage (or consider using sessionStorage or cookies for added security)
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);

        navigate("/"); // Redirect to dashboard or homepage after successful login
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="background">
      <div className="glass-container">
        <div className="logo">
          <span className="logo-icon">L</span>
          <span className="logo-text">Login</span>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="navigate-text">
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="navigate-link">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Animated Boxes */}
      <div className="animated-box box1"></div>
      <div className="animated-box box2"></div>
      <div className="animated-box box3"></div>
      <div className="animated-box box4"></div>
    </div>
  );
};

export default LoginForm;
