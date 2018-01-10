import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import Callback from './Callback/Callback';
import Auth from './Auth/Auth';
import history from './history';

import './App.css';

import Splash from './containers/Splash/Splash';
import Header from './containers/Header';
import Search from './containers/Search';
import User from './containers/User';
import Profile from './containers/Profile';
import EditProfile from './containers/EditProfile';
import Location from './containers/Location/Location';
import FourOhFour from './utils/FourOhFour';
import AddReview from './containers/AddReview/AddReview';

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
      (auth.isAuthenticated() ? <Component auth={auth} {...props} /> : <Redirect to="/note" />)
    }
  />
);
AuthRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

const App = () => (
  <Router history={history}>
    <div>
      <Header auth={auth} />
      <Switch>
        <Route exact path="/" component={Splash} />
        <Route path="/search" component={Search} />
        <AuthRoute path="/add-review" component={AddReview} />
        <AuthRoute path="/profile" component={Profile} />
        <AuthRoute path="/edit-profile" component={EditProfile} />
        <Route
          path="/location/:location_id"
          render={props => <Location auth={auth} {...props} />}
        />
        <Route path="/user/:user_id" render={props => <User auth={auth} {...props} />} />
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
