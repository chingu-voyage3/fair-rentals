import React from 'react';
import { NavLink } from 'react-router-dom';

import './splash.css';

import { BigText, MedText, UserDiv, BigDiv } from '../containers/text-styles';

class Splash extends React.Component {
  constructor() {
    super();
    this.state = {
      user: { name: 'Rich Brown' },
    };
  }
  render() {
    const { user } = this.state;
    return (
      <BigDiv>
        {user && <UserDiv>Welcome, {user.name}</UserDiv>}
        <BigText id="mobile-title">Fair Rents</BigText>
        <MedText id="mobile-sub">Rent reviews for and by renters</MedText>
        <NavLink id="big-link" to="/search">
          Search for a property now
        </NavLink>
      </BigDiv>
    );
  }
}

export default Splash;
