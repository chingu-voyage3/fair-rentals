import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Button } from '../../utils/shared-styles';

const ReviewForm = styled.form`
  width: 100%;
  min-height: 300px;
  padding-bottom: 1em;
  border-bottom: 1px solid steelblue;
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
  height: 6rem;
  min-height: 6rem;
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
    this.state = initialState;
  }

  handleChange = (e) => {
    e.preventDefault();
    return this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { text, stars, review_id } = this.state;
    const { addReview, existingReview } = this.props;

    return (
      <ReviewForm onSubmit={() => addReview(text, stars, review_id)}>
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

        { existingReview ? (
          <Button type="submit">Edit Review</Button>
        ) : (
          <Button type="submit">Submit Review</Button>
        )}
      </ReviewForm>
    );
  }
}

AddReview.propTypes = {
  addReview: PropTypes.func.isRequired,
  existingReview: PropTypes.object, // eslint-disable-line
};

AddReview.defaultProps = {
  existingReview: null,
};

export default AddReview;
