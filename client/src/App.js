import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import Callback from './Callback/Callback';
import Auth from './Auth/Auth';
import history from './history';

import './App.css';

import Splash from './containers/Splash/Splash';
import Login from './containers/Login';
import Search from './containers/Search';
import User from './containers/User';
import Profile from './containers/Profile';
import Location from './containers/Location/Location';
import FourOhFour from './utils/FourOhFour';

const splash_bg = '/pexels-photo-243722.jpeg';
const loc_bg = '/pexels-photo-243722.jpeg';
const user_bg = '/pexels-photo-243722.jpeg';
const profile_bg = '/pexels-photo-243722.jpeg';
const search_bg = '/world_map.png';

const auth = new Auth();

const handleAuthentication = ({ location }) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
};

const AuthRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      (auth.isAuthenticated() ? (
        <Component bg={profile_bg} auth={auth} {...props} />
      ) : (
        <Redirect to="/note" />
      ))
    }
  />
);
AuthRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

const App = () => (
  <Router history={history}>
    <div>
      <Login auth={auth} />
      <Switch>
        <Route exact path="/" render={props => <Splash bg={splash_bg} {...props} />} />
        <Route path="/search" render={props => <Search bg={search_bg} {...props} />} />
        {/* <Route path="/search" component={Search} /> */}
        <AuthRoute path="/profile" component={Profile} />
        <Route
          path="/location/:location_id"
          render={props => <Location auth={auth} bg={loc_bg} {...props} />}
        />
        <Route
          path="/user/:user_id"
          render={props => <User auth={auth} bg={user_bg} {...props} />}
        />
        <Route
          path="/callback"
          render={(props) => {
            handleAuthentication(props);
            return <Callback {...props} />;
          }}
        />
        <Route render={props => <FourOhFour auth={auth} {...props} />} />
      </Switch>
    </div>
  </Router>
);

export default App;
