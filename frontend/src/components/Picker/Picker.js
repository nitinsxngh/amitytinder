import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTimes } from '@fortawesome/free-solid-svg-icons';

const Spinner = () => {
  const [data, setData] = useState([]); // Spinner data
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL; // Get API URL from environment variable

  // Fetch users to display in the spinner
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/spinner-users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const spinnerData = Array.isArray(users)
          ? users.map(user => ({
              id: user.id, // Ensure ID is captured
              option: user.name || 'Anonymous',
              profilePicture: user.profilePicture || 'https://via.placeholder.com/150',
            }))
          : [];
        setData(spinnerData);
      } catch (error) {
        console.error('Error fetching spinner data:', error.message);
      }
    };

    fetchData();
  }, [API_URL]);

  // Handle the spin click
  const handleSpinClick = () => {
    if (data.length < 5) return; // Ensure at least 5 users are required to spin
    const randomIndex = Math.floor(Math.random() * data.length);
    setPrizeNumber(randomIndex);
    setMustSpin(true);
  };

  // Handle spin end (when the wheel stops spinning)
  const handleSpinEnd = () => {
    setWinner(data[prizeNumber].option);
    setMustSpin(false);
    setShowPopup(true); // Show the winner popup
  };

  // Close the popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Handle the connect action
  const handleConnectClick = async () => {
    try {
      const token = localStorage.getItem('token');
      const winnerData = data.find(user => user.option === winner);
      const winnerId = winnerData?.id;

      if (!winnerId) {
        alert('Winner data is unavailable.');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/spinwin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: winnerId, isSpinnerWinner: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      const result = await response.json();
      if (result.mutual) {
        alert('Match created successfully!');
      } else {
        alert('Connection failed. Try again.');
      }
    } catch (error) {
      console.error('Error connecting user:', error.message);
      alert('Connection failed. Try again.');
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '50px',
        fontFamily: "'SF Pro Display', sans-serif",
        color: 'white',
        padding: '20px',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        maxWidth: '500px',
        margin: '50px auto',
      }}
    >
      <div
        style={{
          margin: '20px auto',
          position: 'relative',
          padding: '20px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data.length > 0 ? data : [{ option: 'Loading...', profilePicture: '' }]} // Fallback when data is empty
          backgroundColors={['#c7b6ff', '#E6E6FA', '#c7b6ff']}
          textColors={['#000']}
          outerBorderColor="rgba(255, 255, 255, 0.3)"
          outerBorderWidth={5}
          radiusLineWidth={2}
          radiusLineColor="rgba(255, 255, 255, 0.3)"
          fontSize={14}
          onStopSpinning={handleSpinEnd}
          renderItem={({ option, profilePicture }) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={profilePicture}
                alt={option}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  marginBottom: '5px',
                }}
              />
            </div>
          )}
        />
      </div>
      <button
        onClick={handleSpinClick}
        style={{
          marginTop: '20px',
          padding: '15px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
        }}
        disabled={mustSpin || data.length < 5} // Disable if spinning or fewer than 5 users
      >
        {data.length < 5
          ? 'Can not discover people :('
          : mustSpin
          ? 'Spinning...'
          : 'Spin the Wheel'}
      </button>

{showPopup && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)', // Frosted glass effect
    }}
  >
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.5))',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        width: '300px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
      }}
    >
      <img
        src={data[prizeNumber]?.profilePicture || 'https://via.placeholder.com/150'}
        alt="Profile"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)', // Depth for profile picture
        }}
      />
      <h2
        style={{
          color: '#2B2B2B', // Dark color for visibility
          fontSize: '22px', // Adjust font size for better visibility
          margin: '10px 0',
          fontWeight: '600', // Slightly less bold for elegance
        }}
      >
        {data[prizeNumber]?.option || 'Anonymous'}
      </h2>
      <p
        style={{
          fontSize: '16px',
          color: '#2B2B2B',
          margin: '5px 0',
        }}
      >
        {data[prizeNumber]?.age ? `${data[prizeNumber].age} years old` : 'Age not available'}
      </p>
      <p
        style={{
          fontSize: '14px',
          color: '#4B4B4B',
          margin: '10px 0',
          fontStyle: 'italic',
        }}
      >
        {data[prizeNumber]?.bio || 'No bio available'}
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly', // Equal spacing for buttons
          marginTop: '20px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleConnectClick}
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            color: '#fff',
            background: 'linear-gradient(135deg, #32CD32, #2E8B57)', // Green gradient for Interested
            border: 'none',
            borderRadius: '50%', // Circle button
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Shadow for depth
          }}
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
        <button
          onClick={handleClosePopup}
          style={{
            width: '60px',
            height: '60px',
            fontSize: '24px',
            color: '#fff',
            background: 'linear-gradient(135deg, #FF0066, #FF6699)', // Pink gradient for Not Interested
            border: 'none',
            borderRadius: '50%', // Circle button
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Shadow for depth
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Spinner;
