import React from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';

import './App.css';

import Splash from './containers/Splash/Splash';
import Search from './containers/Search/Search';
import Login from './containers/Login';
import Signup from './containers/Signup';
import User from './containers/User';
import Property from './containers/Property/Property';
import FourOhFour from './utils/FourOhFour';
import AddReview from './containers/AddReview';

const Links = () => (
  <nav>
    <NavLink exact to="/">
      Home
    </NavLink>
    <NavLink to="/add-review">Add Review</NavLink>
    <NavLink to="/user/:user_id">Profile</NavLink>
    <NavLink to="/login">Login</NavLink>
    <NavLink to="/signup">Sign Up</NavLink>
  </nav>
);

const App = () => (
  <Router>
    <div>
      <Links />
      <Switch>
        <Route exact path="/" component={Splash} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/search" component={Search} />
        <Route path="/add-review" component={AddReview} />
        <Route
          path="/property/:prop_id"
          render={({ match }) => <Property id={match.params.prop_id} />}
        />
        <Route path="/user/:user_id" render={({ match }) => <User id={match.params.user_id} />} />
        <Route component={FourOhFour} />
      </Switch>
    </div>
  </Router>
);

export default App;
