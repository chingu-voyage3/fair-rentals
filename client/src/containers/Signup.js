import React from 'react';

class Signup extends React.Component {
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
        Signup page yo: {loading} {user}
      </div>
    );
  }
}

export default Signup;
