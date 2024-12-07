import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./StepForm.module.css";

const StepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    interestedIn: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const API_URL = process.env.REACT_APP_API_URL; // Use API URL from environment variable

  const steps = [
    {
      label: "Name",
      content: (
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => handleChange(e)}
          className={styles.input}
        />
      ),
    },
    {
      label: "Date of Birth",
      content: (
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={(e) => handleChange(e)}
          className={styles.input}
          max={new Date().toISOString().split("T")[0]} // Set max date to today's date
        />
      ),
    },
    {
      label: "Gender",
      content: (
        <select
          name="gender"
          value={formData.gender}
          onChange={(e) => handleChange(e)}
          className={styles.input}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      ),
    },
    {
      label: "Interests",
      content: (
        <select
          name="interestedIn"
          value={formData.interestedIn}
          onChange={(e) => handleChange(e)}
          className={styles.input}
        >
          <option value="">Select Interests</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Both">Both</option>
        </select>
      ),
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name" && /\d/.test(value)) {
      // Prevent input if it contains numbers
      return;
    }

    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error on input change
  };

  const validateStep = () => {
    const { name, dob, gender, interestedIn } = formData;

    // Validate Name (No Numbers)
    if (currentStep === 0 && !name.trim()) {
      return "Name is required.";
    }
    if (currentStep === 0 && /\d/.test(name)) {
      return "Name cannot contain numbers.";
    }

    // Validate Date of Birth (Cannot be Future, User must be at least 18)
    if (currentStep === 1 && !dob) {
      return "Date of Birth is required.";
    }
    if (currentStep === 1) {
      const today = new Date();
      const dobDate = new Date(dob);
      if (dobDate > today) {
        return "Date of Birth cannot be in the future.";
      }
      const age = today.getFullYear() - dobDate.getFullYear();
      const monthDifference = today.getMonth() - dobDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }
      if (age < 18) {
        return "You must be at least 18 years old.";
      }
    }

    // Validate Gender
    if (currentStep === 2 && !gender) {
      return "Gender is required.";
    }

    // Validate Interests
    if (currentStep === 3 && !interestedIn) {
      return "Interests are required.";
    }

    return "";
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError(""); // Clear error on step change
    }
  };

  const handleSubmit = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve the user's token
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass token for authentication
        },
        body: JSON.stringify(formData), // Send form data to backend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      navigate("/"); // Navigate to the homepage or profile page
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "An error occurred.");
    }
  };

  return (
    <div className={styles.formContainer}>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Profile updated successfully!</div>}

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={styles.stepContent}
      >
        <h2>{steps[currentStep].label}</h2>
        {steps[currentStep].content}
      </motion.div>

      <div className={styles.buttonContainer}>
        {currentStep > 0 && (
          <button className={styles.prevBtn} onClick={prevStep}>
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button className={styles.nextBtn} onClick={nextStep}>
            Next
          </button>
        ) : (
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default StepForm;
