import React from 'react';
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
    const graphQLAddUser = `mutation {add_user(username: "${name}", avatar: "${avatar}", auth_id: "${auth_id}") { username, avatar, registered, reviews, _id } }`;
    axios.post('/graphql', { query: graphQLAddUser }).then((response) => {
      console.log(response);
      this.props.auth.setMongoSession(response.data.data.add_user);
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
          <Label htmlFor="name">We don't have a name for you yet.</Label>
          <CredentialFormInput
            type="text"
            name="name"
            value={name}
            onChange={this.handleChange}
            placeholder="name"
          />
          <p />
          <Label htmlFor="avatar">
            If you'd like an avatar, add a link to an image file. (optional)
          </Label>
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

export default EditProfile;
