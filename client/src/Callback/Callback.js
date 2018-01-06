import React from 'react';
import loading from './loading.svg';

// this file taken from auth0 docs but refactored as stateless functional component
const style = {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  height: '100vh',
  width: '100vw',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
};

const Callback = () => (
  <div style={style}>
    <img src={loading} alt="loading" />
  </div>
);

export default Callback;
