import React from 'react';
import {
  BigDiv,
  MedText,
  Label,
  Button,
  CredentialForm,
  CredentialFormInput,
} from '../utils/shared-styles';

class Signup extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      repeatPassword: '',
    };
    this.submitSignup = this.submitSignup.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  submitSignup(e) {
    e.preventDefault();
    // TODO: this needs to be lifted up? so result can be spread around components?
    const { username, password, repeatPassword } = this.state;
    if (!username || !password || !repeatPassword) {
      this.setState({ message: 'Blank fields not allowed' });
      setTimeout(() => {
        this.setState({ message: '' });
      }, 2000);
    }
    if (password !== repeatPassword) {
      this.setState({ message: 'Password fields must match' });
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
    const {
      username, password, repeatPassword, message,
    } = this.state;
    return (
      <BigDiv>
        <MedText>Sign Up</MedText>
        <CredentialForm onSubmit={this.submitSignup}>
          <Label htmlFor="username">Username:</Label>
          <CredentialFormInput
            type="text"
            name="username"
            value={username}
            onChange={this.handleChange}
            placeholder=""
          />
          <Label htmlFor="password">Password:</Label>
          <CredentialFormInput
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            placeholder=""
          />
          <Label htmlFor="repeatPassword">Repeat Password:</Label>
          <CredentialFormInput
            type="password"
            name="repeatPassword"
            value={repeatPassword}
            onChange={this.handleChange}
            placeholder=""
          />
          <Button type="submit">Sign Up</Button>
          <p style={{ color: 'indianred' }}>{message}</p>
        </CredentialForm>
      </BigDiv>
    );
  }
}

export default Signup;
