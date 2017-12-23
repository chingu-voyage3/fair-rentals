/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AuthBtnWrap = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  padding: 0em 0.5em 0em 0.5em;
`;

const AuthBtn = styled.button`
  border: none;
  margin: 0.25rem;
  text-decoration: none;
  color: steelblue;
  font: 1rem 'Barlow Semi Condensed', Helvetica, sans-serif;
  cursor: pointer;
`;

class Login extends React.Component {
  login = () => {
    this.props.auth.login();
  };

  logout = () => {
    this.props.auth.logout();
  };

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <AuthBtnWrap>
        {!isAuthenticated() && <AuthBtn onClick={this.login}>Log In</AuthBtn>}
        {isAuthenticated() && <AuthBtn onClick={this.logout}>Log Out</AuthBtn>}
      </AuthBtnWrap>
    );
  }
}

Login.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default Login;
