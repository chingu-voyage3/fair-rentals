import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Review from '../containers/Review';

import './property.css';

const Photo = styled.img`
  height: 4rem;
  width: 4rem;
  border-radius: 25%;
`;

const Property = ({ property }) => (
  <div className="prop-wrap">
    <div className="header-wrap">
      <Photo src={property.avatar} alt="property avatar" />
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
