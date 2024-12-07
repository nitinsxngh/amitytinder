import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Swipe from "./pages/swipe";
import Login from "./pages/login";
import Register from "./pages/register";
import Spinner from "./pages/spinner";
import Form from "./pages/form";
import Profile from "./pages/profile";
import Messages from "./pages/messages";
import Likes from "./pages/likes";

import ProtectedRoute from "./components/Onboard/ProtectedRoute";
import Chat from "./components/Messages/Chat"; // Ensure correct casing

import "./App.css";

function App() {
  return (
    <Router basename="/react-tinder-card-demo">
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/form" element={<Form />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Swipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/likes"
            element={
              <ProtectedRoute>
                <Likes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spinner"
            element={
              <ProtectedRoute>
                <Spinner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:matchId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
