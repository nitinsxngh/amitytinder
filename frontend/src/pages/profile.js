import React from "react";
import ProfileCard from "../components/Profile/ProfileCard";
import BottomNav from "../BottomNav/BottomNav";

const App = () => {
  return (
    <div
      style={{
        padding: "2.5px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ProfileCard />
      <BottomNav />
    </div>
  );
};

export default App;
