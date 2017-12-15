import React from 'react';
import axios from 'axios';


class Tester extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      user: null,
    };
  }

  componentDidMount() {
    const sample_review = {
      id: 1,
      user_id: 1,
      location_id: 1,
      text: "I will go there again, even though it's not that great",
      score: 4,
    };
    axios.post('http://localhost:3000/add-review', sample_review)
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render() {
    const { loading, user } = this.state;
    return (
      <div>
        Test adding a review yo: {loading} {user}
      </div>
    );
  }
}

export default Tester;
