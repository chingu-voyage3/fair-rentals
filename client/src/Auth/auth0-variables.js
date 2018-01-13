const callbackUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/callback'
    : 'https://fair-rentals.herokuapp.com/callback';

const callbackUrl =
process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/callback'
  : 'https://fair-rentals.herokuapp.com/callback';

const AUTH_CONFIG = {
  domain: 'app83259596.auth0.com',
  clientId: 'NzfwRMKCnd24fhh37tuNDMCzwVrM-GQC',
  callbackUrl,
};

export default AUTH_CONFIG;
