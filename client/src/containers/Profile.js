import React from 'react';
import PropTypes from 'prop-types';

import { BigDiv, MedText, Avatar, Left, RevWrap } from '../utils/shared-styles';
import blankAvatar from '../utils/avatar-blank.jpg';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      avatar: null,
      registered: null,
    };
  }

  componentWillMount() {
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const registered = parseInt(localStorage.getItem('registered'), 10);
    this.setState({ username, avatar, registered });
  }

  render() {
    const { username, avatar, registered } = this.state;
    return (
      <BigDiv>
        <Left>
          <Avatar src={avatar || blankAvatar} alt="user avatar" />
          <MedText>{username}</MedText>
          <p>Member since {new Date(registered).toDateString()}</p>
        </Left>
        <RevWrap>TODO: some Edit Profile stuff</RevWrap>
      </BigDiv>
    );
  }
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired, //eslint-disable-line
};

export default Profile;
