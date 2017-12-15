import React from 'react';

import {
  BigDiv,
  MedText,
  Button,
  Label,
  CredentialForm,
  CredentialFormInput,
} from '../utils/shared-styles';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      message: '',
    };
    this.submitCredentials = this.submitCredentials.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  submitCredentials(e) {
    e.preventDefault();
    // TODO: this needs to be lifted up? so result can be spread around components?
    const { username, password } = this.state;
    if (!username || !password) {
      this.setState({ message: 'Blank fields not allowed' });
      setTimeout(() => {
        this.setState({ message: '' });
      }, 2000);
    }
  }
  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    const { username, password, message } = this.state;
    return (
      <BigDiv>
        <MedText>Log In</MedText>
        <CredentialForm onSubmit={this.submitCredentials}>
          <Label htmlFor="username">Username:</Label>
          <CredentialFormInput
            type="text"
            name="username"
            value={username}
            onChange={this.handleChange}
          />
          <Label htmlFor="password">Password:</Label>
          <CredentialFormInput
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
          />
          <Button type="submit">Log In</Button>
          <p style={{ color: 'indianred' }}>{message}</p>
        </CredentialForm>
      </BigDiv>
    );
  }
}

export default Login;
