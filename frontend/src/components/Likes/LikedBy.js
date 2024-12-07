import React, { useState, useEffect } from 'react';
import './LikedBy.css'; // Ensure your styles are correctly applied

const LikedBy = () => {
  const [likedByProfiles, setLikedByProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikedByProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL; // Fetch base URL from .env file
        const response = await fetch(`${apiUrl}/api/auth/liked-by`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setLikedByProfiles([]);
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          setLikedByProfiles(data.length ? data : []);
        }
      } catch (err) {
        console.error('Error fetching liked-by profiles:', err.message);
        setError('Failed to fetch liked-by profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedByProfiles();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!likedByProfiles.length) {
    return (
      <div className="empty-state-message">
        <img 
          src="img/13.png" 
          alt="No likes yet" 
          className="empty-state-image"
        />
        <p>Your profile is waiting to be discovered. Keep shining!</p>
      </div>
    );
  }

  return (
    <>
      <div className="dynamic-island">
        <span className="dynamic-text">Likes</span>
      </div>

      <div className="liked-by-container">
        <div className="liked-by-grid">
          {likedByProfiles.map(profile => (
            <div className="liked-by-card" key={profile._id}>
              <img
                src={
                  profile.profilePicture
                    ? profile.profilePicture.replace(
                        'https://res.cloudinary.com/dvztynz8i/image/upload/',
                        'https://res.cloudinary.com/dvztynz8i/image/upload/e_blur:5000/'  // Increase blur intensity here
                      )
                    : 'https://via.placeholder.com/150'
                }
                alt="User profile"
                className="liked-by-profile-picture"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LikedBy;
