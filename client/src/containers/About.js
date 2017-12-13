import React from 'react';

class About extends React.Component {
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
        About page yo: {loading} {user}
      </div>
    );
  }
}

export default About;
