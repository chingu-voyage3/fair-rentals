import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

import {
  BigDiv,
  MedText,
  Avatar,
  Left,
  RevWrap,
  Label,
  Button,
  CredentialForm,
  CredentialFormInput,
} from '../utils/shared-styles';

import blankAvatar from '../utils/avatar-blank.jpg';

axios.defaults.headers.post['Content-Type'] = 'application/json';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      avatar: '',
      registered: '',
      _id: '',
      message: '',
    };
  }

  componentWillMount() {
    this.getUserFromStorage();
  }

  getUserFromStorage = () => {
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const registered = parseInt(localStorage.getItem('registered'), 10);
    const _id = localStorage.getItem('_id');
    this.setState({
      username,
      avatar,
      registered,
      _id,
    });
  };
  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  submit = (e) => {
    e.preventDefault();
    const { username, avatar } = this.state;
    if (username === '' || typeof username !== 'string' || username.length > 40) {
      this.setState({ message: "Let's work on that name." });
      return setTimeout(() => {
        this.setState({ message: '' });
      }, 2000);
    }
    const auth_id = jwtDecode(localStorage.getItem('id_token')).sub;
    // TODO: editUser mutation doesn't exist yet
    const graphQLEditUser = `
    mutation {
      editUser(
        username: "${username}",
        avatar: "${avatar}",
        auth_id: "${auth_id}"
      ) {
          username,
          avatar,
          registered
          _id
        }
      }
    `;
    return axios.post('/graphql', { query: graphQLEditUser }).then((response) => {
      this.props.auth.setMongoSession(response.data.data.editUser);
      this.getUserFromStorage();
    });
  };
  render() {
    const {
      username, avatar, registered, _id, message,
    } = this.state;
    return (
      <BigDiv>
        <Left>
          <Avatar src={avatar || blankAvatar} alt="user avatar" />
          <MedText>
            <Link to={`/user/${_id}`}>{username}</Link>
          </MedText>
          <p>Member since {new Date(registered).toDateString()}</p>
        </Left>
        <RevWrap>
          <CredentialForm onSubmit={this.submit}>
            <Label htmlFor="name">Username</Label>
            <CredentialFormInput
              type="text"
              name="name"
              value={username}
              onChange={this.handleChange}
              placeholder="name"
            />
            <p />

            <Button type="submit">Submit</Button>
            <p style={{ color: 'indianred' }}>{message}</p>
          </CredentialForm>
        </RevWrap>
      </BigDiv>
    );
  }
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired, //eslint-disable-line
};

export default Profile;
