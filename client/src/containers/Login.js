import React from 'react';
import { object } from 'prop-types';
import styled from 'styled-components';

const LoginWrap = styled.nav`
  border-top: 1px solid steelblue;
  border-bottom: 1px solid steelblue;
  background: #ddd;
  padding: 1em 0 1em 0;
`;

const AuthBtn = styled.button`
  border: none;
  float: right;
  margin-right: 2em;
  text-decoration: none;
  color: steelblue;
  font: inherit;
  cursor: pointer;
`;

const UserP = styled.span`
  margin-left: 2em;
`;

class Login extends React.Component {
  constructor(auth) {
    super(auth);
    this.state = { ...auth, un: localStorage.getItem('username') };
  }

  setUn() {
    return this.setState({ un: localStorage.getItem('username') });
  }

  render() {
    if (!this.state.un && this.state.auth.isAuthenticated()) {
      setTimeout(this.setUn.bind(this), 500);
    }
    return (
      <LoginWrap>
        {this.state.auth.isAuthenticated() &&
          this.state.un && <UserP>Welcome, {this.state.un}</UserP>}
        {!this.state.auth.isAuthenticated() && (
          <AuthBtn onClick={this.state.auth.login}>Log In</AuthBtn>
        )}
        {this.state.auth.isAuthenticated() && (
          <AuthBtn onClick={this.state.auth.logout}>Log Out</AuthBtn>
        )}
      </LoginWrap>
    );
  }
}

Login.propTypes = {
  auth: object.isRequired, // eslint-disable-line
};

export default Login;
