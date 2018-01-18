/* eslint-disable class-methods-use-this, no-alert, no-console, jsx-a11y/href-no-hash */
import auth0 from 'auth0-js';
import axios from 'axios';

import history from '../history';
import AUTH_CONFIG from './auth0-variables';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: `https://${AUTH_CONFIG.domain}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid profile',
  });

  login = () => {
    this.auth0.authorize();
  };

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
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
    sessionStorage.setItem('access_token', authResult.accessToken);
    sessionStorage.setItem('id_token', authResult.idToken);
    sessionStorage.setItem('expires_at', expiresAt);
    sessionStorage.setItem('username', authResult.idTokenPayload.nickname);
    const graphQLGetUserQuery = `{authUser(auth_id: "${
      authResult.idTokenPayload.sub
    }") { username avatar registered _id } }`;
    return axios
      .post('/graphql', { query: graphQLGetUserQuery })
      .then((response) => {
        try {
          this.setMongoSession(response.data.data.authUser);
          history.go(-2);
        } catch (e) {
          this.createNewUser(authResult);
        }
      })
      .catch((error) => {
        console.log('likely network error in Auth.js: ', error);
      });
  };
  createNewUser = (authResult) => {
    const graphQLAddUser = `
    mutation {
      createUser(
        username: "${authResult.idTokenPayload.nickname}",
        avatar: "${authResult.idTokenPayload.picture}",
        auth_id: "${authResult.idTokenPayload.sub}"
      ) {
          username,
          avatar,
          registered
          _id
        }
      }
    `;
    return axios
      .post('/graphql', { query: graphQLAddUser })
      .then(response => this.setMongoSession(response.data.data.createUser));
  };

  setMongoSession = (createUser) => {
    sessionStorage.setItem('avatar', createUser.avatar);
    sessionStorage.setItem('username', createUser.username);
    sessionStorage.setItem('registered', createUser.registered);
    sessionStorage.setItem('_id', createUser._id);
  };

  logout = () => {
    // Clear access token and ID token from local storage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('expires_at');
    // ...and also our user stuff
    sessionStorage.removeItem('avatar');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('registered');
    sessionStorage.removeItem('_id');
    // navigate to the home route
    history.replace('/');
  };

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(sessionStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  };
}
