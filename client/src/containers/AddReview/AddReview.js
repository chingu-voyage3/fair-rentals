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
  constructor(props) {
    super(props);
    let initialState;
    if (props.existingReview) {
      initialState = {
        text: props.existingReview.text,
        stars: props.existingReview.stars,
        review_id: props.existingReview._id,
      };
    } else {
      initialState = {
        text: '',
        stars: '',
        review_id: '',
      };
    }
    this.state = {
      ...initialState,
      loading: false,
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
    const { text, stars, review_id } = this.state;
    const user_id = localStorage.getItem('_id');

    if (!user_id) {
      return this.messager('How did you get here?!');
    }
    if (text === '' || stars === '') {
      return this.messager('You need to enter a review and stars');
    }
    if (stars < 0 || stars > 5 || isNaN(stars)) {
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
    const editReviewQuery = `
      mutation {
        editReview(
          input: {
            review_id:"${review_id}"
            text:"${text}"
            stars:${stars}
          }
        ) {
          _id
          posted
        }
      }
    `;
    // if review_id exists, run update; otherwise create new review
    const query = review_id ? editReviewQuery : createReviewQuery;
    return axios
      .post('/graphql', { query })
      .then((response) => {
        if (response.status === 200) {
          setTimeout(() => {
            this.setState({ message: '' });
          }, 3000);
          const returnedId = response.data.data.editReview
            ? response.data.data.editReview._id
            : response.data.data.createReview._id;
          return this.setState({
            loading: false,
            message: 'Success!',
            review_id: returnedId,
          }, () => this.props.update()); // parent update fn after setState
        }
        return this.setState({ loading: false }, () => this.messager('Something fouled up'));
      })
      .catch(e => this.messager(`something went wrong: ${e}`));
  };

  handleChange = (e) => {
    e.preventDefault();
    return this.setState({ [e.target.name]: e.target.value });
  };

  handleDelete = (e) => {
    e.preventDefault();
    const { _id } = this.props.existingReview;
    if (!_id) return null;
    const deleteReview = `
      mutation {
        deleteReview(review_id:"${_id}") {
          _id
        }
      }
    `;
    return axios
      .post('/graphql', { query: deleteReview })
      .then((response) => {
        if (response.status === 200) {
          setTimeout(() => {
            this.setState({ message: '' });
          }, 3000);
          return this.setState({
            loading: false,
            message: 'Deleted!',
            text: '',
            stars: '',
            review_id: '',
          }, () => this.props.update()); // parent update fn after setState
        }
        return this.setState({ loading: false }, () =>
          this.messager('Something went wrong while deleting.'));
      })
      .catch(err => this.messager(`deleting error: ${err}`));
  };

  render() {
    const {
      loading, message, text, stars, review_id,
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
        {review_id && (
          <Button type="button" onClick={this.handleDelete}>
            Delete Review
          </Button>
        )}
      </ReviewForm>
    );
  }
}

AddReview.propTypes = {
  update: PropTypes.func.isRequired,
  location_id: PropTypes.string.isRequired,
  existingReview: PropTypes.object, // eslint-disable-line
};

AddReview.defaultProps = {
  existingReview: null,
};

export default AddReview;
