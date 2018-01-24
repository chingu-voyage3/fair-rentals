import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Billboard = styled.div`
  background: #055b75;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.33) 38%, rgba(0, 0, 0, 0.33) 98%);
  border-radius: 8px;
  margin: 0.5em 0 2em 0;
`;

const Text = styled.span`
  font-family: Geneva;
  font-weight: 300;
  font-size: 36px;
  color: #ffffff;
  padding: 0.25em;
  margin: 0;
`;

const SmallBillboard = () => (
  <Billboard>
    <NavLink to="/">
      <Text>Fair Rentals</Text>
    </NavLink>
  </Billboard>
);

export default SmallBillboard;
