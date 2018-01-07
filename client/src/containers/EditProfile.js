/* eslint-disable class-methods-use-this, no-alert, no-console, jsx-a11y/href-no-hash */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import {
  BigDiv,
  MedText,
  Label,
  Button,
  CredentialForm,
  CredentialFormInput,
} from '../utils/shared-styles';

axios.defaults.headers.post['Content-Type'] = 'application/json';

class EditProfile extends React.Component {
  state = {
    name: '',
    avatar: '',
    message: '',
  };
  submit = (e) => {
    e.preventDefault();
    const { name, avatar } = this.state;
    if (name === '' || typeof name !== 'string' || name.length > 40) {
      this.setState({ message: "Let's work on that name." });
      return setTimeout(() => {
        this.setState({ message: '' });
      }, 2000);
    }
    const auth_id = jwtDecode(localStorage.getItem('id_token')).sub;
    const graphQLAddUser = `
    mutation {
      createUser(
        username: "${name}",
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
    return axios.post('/graphql', { query: graphQLAddUser }).then((response) => {
      this.props.auth.setMongoSession(response.data.data.createUser);
      this.props.history.push('/');
    });
  };
  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    const { name, avatar, message } = this.state;
    return (
      <BigDiv>
        <MedText>Welcome!</MedText>
        <p />
        <CredentialForm onSubmit={this.submit}>
          <Label htmlFor="name">We have no name for you, yet.</Label>
          <CredentialFormInput
            type="text"
            name="name"
            value={name}
            onChange={this.handleChange}
            placeholder="name"
          />
          <p />
          <Label htmlFor="avatar">Add a link to an image/avatar file. (optional)</Label>
          <CredentialFormInput
            type="avatar"
            name="avatar"
            value={avatar}
            onChange={this.handleChange}
            placeholder=""
          />
          <Button type="submit">Submit</Button>
          <p style={{ color: 'indianred' }}>{message}</p>
        </CredentialForm>
      </BigDiv>
    );
  }
}

EditProfile.propTypes = {
  auth: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
};

export default EditProfile;
