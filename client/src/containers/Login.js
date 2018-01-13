import React from 'react';
import { object } from 'prop-types';
import styled from 'styled-components';

const LoginWrap = styled.nav`
  border-top: 1px solid steelblue;
  border-bottom: 1px solid steelblue;
  background: #ddd;
  width: 100%;
  height: 3rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  @media (max-width: 450px) {
    justify-content: space-around;
    font-size: 0.75rem;
  }
`;

const AuthBtn = styled.button`
  border: none;
  margin-right: 2rem;
  text-decoration: none;
  color: steelblue;
  font: inherit;
  cursor: pointer;
`;

const UserP = styled.p`
  margin-right: auto;
  margin-left: 2em;
  @media (max-width: 450px) {
    margin: 0.5rem 0 0.5rem 0;
  }
`;

const Login = ({ auth }) => {
  const { isAuthenticated, login, logout } = auth;
  const un = localStorage.getItem('username');
  return (
    <LoginWrap>
      {isAuthenticated() && un && <UserP>Welcome, {un}</UserP>}
      {!isAuthenticated() && <AuthBtn onClick={login}>Log In</AuthBtn>}
      {isAuthenticated() && <AuthBtn onClick={logout}>Log Out</AuthBtn>}
    </LoginWrap>
  );
};

Login.propTypes = {
  auth: object.isRequired, // eslint-disable-line
};

export default Login;
