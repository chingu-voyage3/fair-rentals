import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Loading from '../containers/Loading';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      user: null,
    };
  }

  componentWillMount() {
    // validate id on props
    const { id } = this.props;
    console.log(`id is: ${id}`);

    // server lookup of user, mocked for now
    axios.get('https://randomuser.me/api/').then((results) => {
      const { registered, picture, name } = results.data.results[0];
      const user = { registered, avatar: picture.thumbnail, name: `${name.first} ${name.last}` };
      // set user in state
      this.setState({ user, loading: false });
    });
  }

  render() {
    const { loading, user } = this.state;
    if (loading || !user) return <Loading />;
    return (
      <div>
        <img src={user.avatar} alt="user avatar" />
        <h1>Username: {user.name}</h1>
        <h3>Member since {user.registered}</h3>
      </div>
    );
  }
}

User.propTypes = {
  id: PropTypes.string.isRequired,
};

export default User;
