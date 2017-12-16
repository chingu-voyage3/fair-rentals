import React from 'react';
import PropTypes from 'prop-types';

const Star = ({ number }) => {
  if (number < 1 || number > 5) return null;
  const arr = Array(5).fill(0);
  arr.fill(1, number);
  const stars = arr.map((a, i) => (
    <svg
      key={i} // eslint-disable-line
      xmlns="http://www.w3.org/2000/svg"
      fill={a === 0 ? 'steelblue' : '#efefef'}
      stroke="#000"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ));
  return <div>{stars}</div>;
};

Star.propTypes = {
  number: PropTypes.number.isRequired,
};

export default Star;
