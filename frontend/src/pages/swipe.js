import React, { useState } from 'react';
import Switch from 'react-ios-switch';
import BottomNav from "../BottomNav/BottomNav";
import Advanced from '../Swipe/Advanced';
import Simple from '../Swipe/Simple';

function Swipe() {
  const [showAdvanced, setShowAdvanced] = useState(true);

  return (
    <div className='app'>
      {showAdvanced ? <Advanced /> : <Simple />}
      <div className='row'>
        <p style={{ color: '#fff' }}>Show advanced example</p>
        <Switch checked={showAdvanced} onChange={setShowAdvanced} />
      </div>
      <BottomNav />

    </div>
  );
}

export default Swipe;
