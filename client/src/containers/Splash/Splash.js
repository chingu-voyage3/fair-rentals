import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import Recents from '../Recents';

import './splash.css';

import { BigDiv } from '../../utils/shared-styles';

const AboutText = styled.p`
  font-family: Geneva;
  font-size: 32px;
  letter-spacing: 1px;
  color: #185263;
  text-align: center;
  margin: 0;
  padding: 0;
`;

const SplashBillboard = styled.div`
  background: #055b75;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.33) 38%, rgba(0, 0, 0, 0.33) 98%);
  border-radius: 8px;
  margin: 0.5em 0 2em 0;
`;

const SplashTitle = styled.p`
  font-family: Geneva;
  font-weight: 300;
  font-size: 96px;
  color: #ffffff;
  padding: 0.25em;
  margin: 0;
`;

const SeeWhat = styled.p`
  width: 80%;
  padding-bottom: 0.125em;
  text-align: center;
  background: white;
  textalign: center;
  margin-top: 6em;
  font-size: 2em;
`;

class Splash extends React.Component {
  state = {
    initialRender: true,
  };

  componentWillMount() {
    document.body.style.background = `url(${this.props.bg}) no-repeat center center / cover`;
  }

  tick = () => (this.state.initialRender ? this.setState({ initialRender: false }) : null);

  render() {
    if (this.state.initialRender) {
      setTimeout(this.tick, 500);
    } else {
      setTimeout(this.tick, 15000);
    }

    return (
      <BigDiv>
        <Helmet>
          <title>Fair Rentals</title>
        </Helmet>
        <SplashBillboard>
          <SplashTitle>Fair Rentals</SplashTitle>
        </SplashBillboard>
        <AboutText>
          Reviews for rental properties.<br />
          Written by renters for renters.
        </AboutText>
        <NavLink id="big-link" to="/search">
          <AboutText>Search Now</AboutText>
        </NavLink>

        <SeeWhat>See what people are saying...</SeeWhat>
        <Recents />
      </BigDiv>
    );
  }
}

Splash.propTypes = {
  bg: PropTypes.string.isRequired,
};

export default Splash;
