import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Stars from 'simple-rating-stars';

import './review.css';

const Review = ({ rev, index }) => {
  const timing = 0.25 + 0.25 * index;
  let topLine;
  let linkTo;
  if (rev.location) {
    topLine = rev.location.placename;
    linkTo = `/location/${rev.location._id}`;
  } else if (rev.user) {
    topLine = `${rev.user.username}, member since ${new Date(rev.user.registered).toDateString()}`;
    linkTo = `/user/${rev.user._id}`;
  }
  return (
    <div style={{ animationDelay: `${timing}s` }} className="review-wrap">
      <p className="top-line">
        <Link to={linkTo}>{topLine}</Link>
      </p>
      <Stars stars={parseInt(rev.stars, 10)} outOf={5} full="#134999" empty="#fff" stroke="#000" />
      <p className="review-text">{rev.text}</p>
      <p className="posted-text">review posted {new Date(rev.posted).toDateString()}</p>
    </div>
  );
};

Review.propTypes = {
  index: PropTypes.number.isRequired,
  rev: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    location: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      placename: PropTypes.string.isRequired,
    }),
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      registered: PropTypes.number.isRequired,
    }),
    text: PropTypes.string.isRequired,
    stars: PropTypes.string.isRequired,
    posted: PropTypes.number.isRequired,
  }).isRequired,
};

export default Review;
