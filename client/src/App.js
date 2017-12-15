import React from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';

import './App.css';

import Splash from './containers/Splash';
import Search from './containers/Search';
import About from './containers/About';
import Login from './containers/Login';
import Signup from './containers/Signup';
import User from './containers/User';
import Property from './containers/Property';
import FourOhFour from './containers/FourOhFour';
import Tester from './containers/TEST-Add-Review';

const Links = () => (
  <nav>
    <NavLink exact to="/">
      Home
    </NavLink>
    <NavLink to="/about">About</NavLink>
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
        <Route path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/search" component={Search} />
        <Route path="/contact" render={() => <h1>Contact...</h1>} />
        <Route path="/tester" component={Tester} />
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
