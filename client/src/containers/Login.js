import React from 'react';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      user: null,
    };
  }
  render() {
    const { loading, user } = this.state;
    return (
      <div>
        login page yo: {loading} {user}
      </div>
    );
  }
}

export default Login;
