require('dotenv').config();
const callbackPort = process.env.PORT || 3000;

const AUTH_CONFIG = {
  domain: 'app83259596.auth0.com',
  clientId: 'NzfwRMKCnd24fhh37tuNDMCzwVrM-GQC',
  callbackUrl: `http://localhost:${callbackPort}/callback`,
};

export default AUTH_CONFIG;
