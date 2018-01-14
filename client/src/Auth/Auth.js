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
        history.go(-2);
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
    localStorage.setItem('username', authResult.idTokenPayload.nickname);
    const graphQLGetUserQuery = `{authUser(auth_id: "${
      authResult.idTokenPayload.sub
    }") { username avatar registered _id } }`;
    axios
      .post('/graphql', { query: graphQLGetUserQuery })
      .then((response) => {
        try {
          this.setMongoSession(response.data.data.authUser);
        } catch (e) {
          this.createNewUser(authResult);
        }
      })
      .catch((error) => {
        console.log('likely network error in Auth.js: ', error);
      });
    // navigate to the home route (this only triggers if catch above is run)
    return history.replace('/');
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
    localStorage.setItem('avatar', createUser.avatar);
    localStorage.setItem('username', createUser.username);
    localStorage.setItem('registered', createUser.registered);
    localStorage.setItem('_id', createUser._id);
  };

  logout = () => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // ...and also our user stuff
    localStorage.removeItem('avatar');
    localStorage.removeItem('username');
    localStorage.removeItem('registered');
    localStorage.removeItem('_id');
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
