import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import Loading from '../../utils/Loading';
import { BigDiv, Button } from '../../utils/shared-styles';

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
  height: 15rem;
`;
const Score = styled.input`
  font: 1.125rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 1rem;
  text-align: center;
`;

class Tester extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      user: null,
      text: '',
      location_id: '',
      score: '',
      message: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.addReview = this.addReview.bind(this);
  }

  componentDidMount() {}

  addReview() {
    const { text, location_id, score } = this.state;
    const { _id } = this.state.user;
    const reviewToPost = {
      text,
      location_id,
      score,
      _id,
    };
    // TODO: validate inputs appropriately
    this.setState({ loading: true });
    axios
      .post('http://localhost:3000/add-review', reviewToPost)
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            loading: false,
            text: '',
            location_id: '',
            score: '',
            message: 'Success!',
          });
          setTimeout(() => {
            this.setState({ message: '' }, () => <Redirect to="/" />);
          }, 3000);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, message: 'Something went wrong.' });
        setTimeout(() => {
          this.setState({ message: '' });
        }, 3000);
      });
  }
  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    const {
      loading, message, text, score,
    } = this.state;
    if (loading) return <Loading />;
    if (message) {
      return (
        <div>
          <Loading />
          <p>{message} Redirecting...</p>
        </div>
      );
    }
    return (
      <BigDiv>
        <ReviewForm onSubmit={this.addReview}>
          <Label htmlFor="text">Your review:</Label>
          <TextInput
            type="text"
            name="text"
            value={text}
            onChange={this.handleChange}
            placeholder=" review text"
          />

          <Label htmlFor="score">Your score (0-5):</Label>
          <Score type="text" name="score" value={score} onChange={this.handleChange} />

          <Button type="submit">Submit Review</Button>
        </ReviewForm>
      </BigDiv>
    );
  }
}

export default Tester;
