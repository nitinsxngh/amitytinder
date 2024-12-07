import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./LoginForm.css";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate(); // Initialize the navigate function

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Invalid email format.";
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return "";
  };

  const validateConfirmPassword = (value) => {
    return value === password ? "" : "Passwords do not match.";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    
    if (!emailError && !passwordError && !confirmPasswordError) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, confirmPassword }),
        });
  
        const data = await response.json();
        if (response.ok) {
          // Save JWT token to localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("username", data.username);
  
          // Redirect to form page using navigate
          navigate("/form");  // Adjusted to use navigate
        } else {
          alert(data.error || "Registration failed. Please try again.");
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error during registration:", error);
      }
    } else {
      setErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
    }
  };

  return (
    <div className="background">
      <div className="glass-container">
        <div className="logo">
          <span className="logo-icon">R</span>
          <span className="logo-text">Register</span>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          {errors.email && <span className="error">{errors.email}</span>}
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}
          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
          <input
            type="password"
            placeholder="Confirm Password"
            className="input"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
        <div className="navigate-text">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="navigate-link">
              Login
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

export default RegisterForm;
