import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';

import { BigDiv, MedText, Avatar } from '../utils/shared-styles';
import Review from './Review/Review';
import blankAvatar from '../utils/avatar-blank.jpg';

const Left = styled.div`
  max-height: 200px;
  align-self: flex-start;
  padding: 4em 0em 0em 1em;
`;

const RevWrap = styled.div`
  padding: 1rem;
  margin: 1rem;
  width: 50%;
`;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      avatar: null,
      registered: null,
      reviews: null,
    };
  }

  componentWillMount() {
    this.getProfile();
  }

  getProfile = () => {
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const registered = localStorage.getItem('registered');
    const review_ids = localStorage.getItem('review_ids');
    this.setState({ username, avatar, registered }, () => {
      if (review_ids && review_ids.length > 0) {
        axios.get('/get-reviews', { params: { review_ids } }).then((response) => {
          this.setState({ reviews: response.data.reviews });
        });
      }
    });
  };

  render() {
    const {
      username, avatar, registered, reviews,
    } = this.state;
    return (
      <BigDiv>
        <Left>
          <Avatar src={avatar || blankAvatar} alt="user avatar" />
          <MedText>{username}</MedText>
          <p>Member since {new Date(registered).toDateString()}</p>
        </Left>
        <RevWrap>
          {reviews && reviews.map((rev, i) => <Review key={rev.review_id} rev={rev} index={i} />)}
        </RevWrap>
      </BigDiv>
    );
  }
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired, //eslint-disable-line
};

export default Profile;
