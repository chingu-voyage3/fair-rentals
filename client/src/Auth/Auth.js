/* eslint-disable class-methods-use-this, no-alert, no-console */
import auth0 from 'auth0-js';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import history from '../history';
import AUTH_CONFIG from './auth0-variables';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid',
  });

  login = () => {
    this.auth0.authorize();
  };

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace('/');
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  };

  setSession = (authResult) => {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    const { sub } = jwtDecode(authResult.idToken);
    axios
      .get('/profile', { params: { sub } })
      .then((response) => {
        this.setMongoSession(response.data.user);
      })
      .catch(() => {
        // not found in existing DB, must be new sign up
        // send to /edit instead:
        history.replace('/edit-profile');
      });
    // navigate to the home route
    history.replace('/');
  };

  setMongoSession = (userData) => {
    localStorage.setItem('avatar', userData.avatar);
    localStorage.setItem('username', userData.name);
    localStorage.setItem('registered', userData.registered);
    localStorage.setItem('review_ids', userData.reviews);
  };

  logout = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('avatar');
    localStorage.removeItem('review_ids');
    localStorage.removeItem('username');
    localStorage.removeItem('registered');
    // navigate to the home route
    history.replace('/');
  };

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  };
}
