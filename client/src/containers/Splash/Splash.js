import React from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Recents from '../Recents';

import './splash.css';

import { BigText, MedText, BigDiv } from '../../utils/shared-styles';


class Splash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialRender: true,
    };
  }

  componentWillMount() {
    this.setState({ initialTime: new Date() });
  };

  tick() {
    if (this.state.initialRender) {
      return this.setState({ currentTime: new Date(), initialRender: false });
    }
    else {
      return this.setState({ currentTime: new Date() });
    }


  }

  render() {
    if (this.state.initialRender) {
      setTimeout(this.tick.bind(this), 500);
    }
    else {
      setTimeout(this.tick.bind(this), 15000);
    }

    return (
      <BigDiv>
      <Helmet>
        <title>{`Fair Rentals`}</title>
      </Helmet>
        <BigText id="mobile-title">Fair Rentals</BigText>
        <MedText id="mobile-sub">Reviews for rental properties written by renters for renters</MedText>
        <NavLink id="big-link" to="/search">
          Search for a rental location now
        </NavLink>
        <Recents />
      </BigDiv>
    )
  }
}

export default Splash;
