import MatchesList from "../components/Messages/MatchesList";
import BottomNav from "../BottomNav/BottomNav";
import { useState } from "react";

const Messages = () => {
  const [loading, setLoading] = useState(true);

  const handleMatchesLoaded = () => {
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflowY: 'scroll',
      justifyContent: 'center', // Centers content vertically
      alignItems: 'center'       // Centers content horizontally
    }}>
      <MatchesList onLoad={handleMatchesLoaded} />
      <BottomNav />
    </div>
  );
};

export default Messages;
