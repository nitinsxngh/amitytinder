import React from 'react';
import './Ghost.scss'; // Importing the SCSS file

const Ghost = () => {
  return (
    <div id="ghost">
      <div className="wrapper">
        <div id="face"></div>
      </div>
      <div id="bottom1"></div>
      <div id="bottom2"></div>
      <div id="bottom3"></div>
      <div id="shadow"></div>
    </div>
  );
};

export default Ghost;
