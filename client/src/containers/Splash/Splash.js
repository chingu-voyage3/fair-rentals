import React from 'react';
import { NavLink } from 'react-router-dom';

import Recents from '../Recents';

import './splash.css';

import { BigText, MedText, BigDiv } from '../../utils/shared-styles';

const Splash = () => (
  <BigDiv>
    <BigText id="mobile-title">Fair Rentals</BigText>
    <MedText id="mobile-sub">Reviews for rental properties written by renters for renters</MedText>
    <NavLink id="big-link" to="/search">
      Search for a rental location now
    </NavLink>
    <Recents />
  </BigDiv>
);

export default Splash;
