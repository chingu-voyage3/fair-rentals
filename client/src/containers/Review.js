import React from 'react';
import PropTypes from 'prop-types';

import Star from './Star';

import './review.css';

const Review = ({ rev, index }) => {
  const timing = 0.25 + 0.25 * index;
  return (
    <div style={{ animationDelay: `${timing}s` }} className="review-wrap">
      <p className="user">User #{rev.user_id} says:</p>
      <p className="review-text">{rev.text}</p>
      <Star number={rev.score} />
    </div>
  );
};

Review.propTypes = {
  index: PropTypes.number.isRequired,
  rev: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user_id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
};

export default Review;
