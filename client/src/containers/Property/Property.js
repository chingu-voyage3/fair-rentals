import React from 'react';
import PropTypes from 'prop-types';

import Review from '../Review/Review';
import { Avatar } from '../../utils/shared-styles';

import './property.css';

const Property = ({ property }) => (
  <div className="prop-wrap">
    <div className="header-wrap">
      <Avatar src={property.avatar} alt="property avatar" />
      <h1>{property.name}</h1>
    </div>
    {property.reviews.map((rev, i) => <Review key={rev.id} rev={rev} index={i} />)}
  </div>
);

Property.propTypes = {
  property: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    reviews: PropTypes.array.isRequired,
  }).isRequired,
};

export default Property;
