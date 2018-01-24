import React from 'react';
import { object } from 'prop-types';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const LoginWrap = styled.nav`
  margin: 0 0 1em 0;
  padding: 1em 3em 1em 0;
  height: 1.5em;
  background: white;
`;

const LoginText = styled.span`
  font-family: Geneva;
  font-size: 16px;
  color: #185263;
  margin: 0;
  padding: 0.25em;
`;

const AuthBtn = styled.button`
  border: none;
  float: right;
  text-decoration: none;
  color: #185263;
  background: white;
  font: inherit;
  cursor: pointer;
`;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: sessionStorage.getItem('username') };
  }

  setUsername = () => this.setState({ username: sessionStorage.getItem('username') });

  render() {
    const { auth } = this.props;
    const { username } = this.state;
    const { isAuthenticated, login, logout } = auth;
    if (!username && isAuthenticated()) {
      setTimeout(this.setUsername, 500);
    }
    return (
      <LoginWrap>
        {isAuthenticated() &&
          username && (
            <LoginText>
              Welcome, {`${username} `}
              <NavLink style={{ marginLeft: '1em' }} to="/profile">
                Your profile
              </NavLink>
            </LoginText>
          )}
        {!isAuthenticated() && (
          <AuthBtn onClick={login}>
            <LoginText>Log In</LoginText>
          </AuthBtn>
        )}
        {isAuthenticated() && (
          <AuthBtn onClick={logout}>
            <LoginText>Log Out</LoginText>
          </AuthBtn>
        )}
      </LoginWrap>
    );
  }
}

Login.propTypes = {
  auth: object.isRequired, // eslint-disable-line
};

export default Login;
