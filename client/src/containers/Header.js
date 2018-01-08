import React from 'react';
import { object } from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import Login from './Login';

const NavWrap = styled.nav`
  display: flex;
  flex-flow: column nowrap;
`;

const Menu = styled.nav`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  background: #eee;
  transition: 0.35s all;
  > a {
    margin: 0.5rem 2rem 0.5em 0.5em;
  }
  @media (max-width: 450px) {
    justify-content: space-around;
    font-size: 0.75rem;
  }
`;

const Header = ({ auth }) => (
  <NavWrap>
    <Menu>
      <NavLink exact to="/">
        Home
      </NavLink>
      {auth.isAuthenticated() && <NavLink to="/add-review">Add Review</NavLink>}
      {auth.isAuthenticated() && <NavLink to="/profile">Edit Profile</NavLink>}
    </Menu>
    <Login auth={auth} />
  </NavWrap>
);

Header.propTypes = { auth: object.isRequired }; // eslint-disable-line

export default Header;
