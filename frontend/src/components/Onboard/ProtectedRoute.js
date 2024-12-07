import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setRedirectPath("/login"); // Redirect to login if no token
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Check if any required field is missing
        const { name, dob, gender, interestedIn } = userData;
        if (!name || !dob || !gender || !interestedIn) {
          setRedirectPath("/form"); // Redirect to form if profile is incomplete
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setRedirectPath("/login"); // Redirect to login on error
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    // Optionally show a loading spinner or placeholder
    return <div>Loading...</div>;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return children; // Render the protected component if all checks pass
};

export default ProtectedRoute;
