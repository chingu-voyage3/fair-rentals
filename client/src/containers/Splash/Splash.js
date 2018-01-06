import React from 'react';
import { NavLink } from 'react-router-dom';

import Recents from '../Recents';

import './splash.css';

import { BigText, MedText, BigDiv } from '../../utils/shared-styles';

const Splash = () => (
  <BigDiv>
    <BigText id="mobile-title">Fair Rents</BigText>
    <MedText id="mobile-sub">Rent reviews for and by renters</MedText>
    <NavLink id="big-link" to="/search">
      Search for a rental location now
    </NavLink>
    <Recents />
  </BigDiv>
);

export default Splash;
