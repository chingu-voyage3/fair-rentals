// require('dotenv').config();

const callbackPort = process.env.PROD ? '3333' : '3000';

const AUTH_CONFIG = {
  domain: 'bear13.auth0.com',
  clientId: 'fxbqm2dH9hWq2yOi2h65fAKRXsMf6vW1',
  callbackUrl: `http://localhost:${callbackPort}/callback`,
};

export default AUTH_CONFIG;
