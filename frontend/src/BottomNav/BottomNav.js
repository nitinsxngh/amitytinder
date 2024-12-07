import React from "react";
import { NavLink } from "react-router-dom";
import { FaHeart, FaUserAlt, FaComments, FaSearch, FaSyncAlt } from "react-icons/fa";
import "./BottomNav.css";

const BottomNav = () => {
  return (
    <div className="bottom-nav-wrapper">
      <div className="bottom-nav">
        {/* Matchmaker */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaSearch className="icon" />
        </NavLink>

        {/* Favorites */}
        <NavLink
          to="/likes"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaHeart className="icon" />
        </NavLink>

        {/* Chatroulette Spinner */}
        <div className="central-icon">
          <NavLink
            to="/spinner"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FaSyncAlt className="icon" />
          </NavLink>
        </div>

        {/* Messages */}
        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaComments className="icon" />
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <FaUserAlt className="icon" />
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
