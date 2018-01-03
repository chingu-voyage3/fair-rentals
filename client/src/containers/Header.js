import React from 'react';
import { object } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Login from './Login';

const LoginNav = styled.nav`
  border-top: 1px solid steelblue;
  border-bottom: 1px solid steelblue;
  background: #ddd;
  height: 1rem;
`;
const Header = ({ auth }) => (
  <div>
    <nav>
      <NavLink exact to="/">
        Home
      </NavLink>
      {auth.isAuthenticated() && <NavLink to="/add-review">Add Review</NavLink>}
      {auth.isAuthenticated() && <NavLink to="/profile">Profile</NavLink>}
    </nav>
    <LoginNav>
      <Login auth={auth} />
    </LoginNav>
  </div>
);

Header.propTypes = { auth: object.isRequired }; // eslint-disable-line

export default Header;
