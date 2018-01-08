const callbackPort = process.env.NODE_ENV === 'development' ? '3000' : '3333';

const AUTH_CONFIG = {
  domain: 'bear13.auth0.com',
  clientId: 'fxbqm2dH9hWq2yOi2h65fAKRXsMf6vW1',
  callbackUrl: `http://localhost:${callbackPort}/callback`,
};

export default AUTH_CONFIG;
