import React from 'react';
import PropTypes from 'prop-types';

import Star from '../../utils/Star';

import './review.css';

const Review = ({ rev, index }) => {
  const timing = 0.25 + 0.25 * index;
  let topLine;
  if (rev.location_name) {
    topLine = `${rev.location_name}:`;
  } else if (rev.user_id) {
    topLine = `User #${rev.user_id} says:`;
  }
  return (
    <div style={{ animationDelay: `${timing}s` }} className="review-wrap">
      <p className="top-line">{topLine}</p>
      <p className="review-text">{rev.text}</p>
      <Star number={rev.stars} />
    </div>
  );
};

Review.propTypes = {
  index: PropTypes.number.isRequired,
  rev: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user_id: PropTypes.number,
    location_id: PropTypes.number,
    text: PropTypes.string.isRequired,
    stars: PropTypes.number.isRequired,
  }).isRequired,
};

export default Review;
