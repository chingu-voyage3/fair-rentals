import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';

import Loading from '../../utils/Loading';
import { Button, MedText } from '../../utils/shared-styles';

const ReviewForm = styled.form`
  width: 100%;
  padding: 10%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

const Label = styled.label`
  padding: 0.25rem;
`;
const TextInput = styled.textarea`
  font: 1rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 40rem;
  max-width: 90%;
  height: 8rem;
  min-height: 2rem;
`;
const Score = styled.input`
  font: 1.125rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 2rem;
  text-align: center;
`;

class AddReview extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      text: '',
      stars: '',
      // geometry: {
      //   type: 'point',
      //   coordinates: [0, 0],
      // },
      message: '',
    };
  }

  messager = (message) => {
    setTimeout(() => {
      this.setState({ message: '' });
    }, 3000);
    return this.setState({ message, loading: false });
  };

  addReview = async () => {
    this.setState({ loading: true });

    const { location_id } = this.props;
    const { text, stars } = this.state;
    const user_id = localStorage.getItem('_id');

    if (!user_id) {
      return this.messager('How did you get here?!');
    }
    if (text === '' || stars === '') {
      return this.messager('You need to enter a review and stars');
    }
    if (stars < 0 || stars > 5 || isNaN(stars)) {
      // TODO: can still enter decimals; they just don't display correctly.
      return this.messager('Stars needs to be an integer from 0 to 5');
    }

    const createReviewQuery = `
      mutation {
        createReview(
          user_id:"${user_id}"
          location_id:"${location_id}"
          text:"${text}"
          stars:"${stars}"
        ) {
          _id
          posted
          location_id
        }
      }
    `;
    axios
      .post('/graphql', { query: createReviewQuery })
      .then((response) => {
        if (response.status === 200) {
          setTimeout(() => {
            this.setState({ message: '' });
          }, 1000);
          return this.setState({ loading: false, message: 'Success!' });
        }
        return this.setState({ loading: false }, () => this.messager('Something fouled up'));
      })
      .catch(e => this.messager(`something went wrong: ${e}`));
    return location_id;
  };

  handleChange = (e) => {
    e.preventDefault();
    return this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const {
      loading, message, text, stars,
    } = this.state;

    if (loading) return <Loading />;
    if (message) return <MedText>{message}</MedText>;

    return (
      <ReviewForm onSubmit={this.addReview}>
        <Label htmlFor="text">Your review:</Label>
        <TextInput
          type="text"
          name="text"
          value={text}
          onChange={this.handleChange}
          placeholder=" review text"
        />

        <Label htmlFor="stars">Your stars (0-5):</Label>
        <Score
          type="number"
          min="0"
          max="5"
          name="stars"
          value={stars}
          onChange={this.handleChange}
        />

        <Button type="submit">Submit Review</Button>
      </ReviewForm>
    );
  }
}

AddReview.propTypes = {
  location_id: PropTypes.string.isRequired,
};

export default AddReview;
