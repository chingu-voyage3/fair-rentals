import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import Loading from '../../utils/Loading';
import { BigDiv, Button, MedText } from '../../utils/shared-styles';

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
const PlaceInput = styled.textarea`
  font: 1rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 40rem;
  max-width: 90%;
  height: 2rem;
`;
const Score = styled.input`
  font: 1.125rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 1rem;
  text-align: center;
`;

class AddReview extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      text: '',
      stars: '',
      placename: '',
      location_id: '',
      // geometry: {
      //   type: 'point',
      //   coordinates: [0, 0],
      // },
      message: '',
      redirect: false,
    };
  }

  componentDidMount() {}

  messager = (message) => {
    setTimeout(() => {
      this.setState({ message: '' });
    }, 3000);
    return this.setState({ message, loading: false });
  };

  checkLocation = async (placename) => {
    const existingLocQuery = `
      query {
        locationName(
          placename:"${placename}"
        ) {
          _id
        }
      }
    `;
    const createLocQuery = `
      mutation {
        createLocation(
          placename: "${placename}"
        ) {
          _id
        }
      }
    `;
    let location_id;
    try {
      return await axios
        .post('/graphql', { query: existingLocQuery })
        .then(response => response.data.data.locationName._id);
    } catch (e) {
      location_id = await axios
        .post('/graphql', { query: createLocQuery })
        .then(response => response.data.data.createLocation._id);
    }
    return location_id;
  };

  addReview = async () => {
    this.setState({ loading: true });

    const { text, stars, placename } = this.state;
    const user_id = localStorage.getItem('_id');

    if (!user_id) {
      return this.messager('How did you get here?!');
    }
    if (text === '' || stars === '' || placename === '') {
      return this.messager('You need to enter a review and stars');
    }
    const starnum = parseInt(stars, 10);
    if (starnum < 0 || starnum > 5 || isNaN(starnum)) {
      // TODO: can still enter decimals; they just don't display correctly.
      return this.messager('Stars needs to be an integer from 0 to 5');
    }

    const location_id = await this.checkLocation(placename);
    this.setState({ location_id });

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
            this.setState({ redirect: true });
          }, 1000);
          return this.setState({ loading: false, message: 'Success!'});
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
      loading, message, text, stars, placename, redirect, location_id,
    } = this.state;
    if (loading) {
      return (
        <BigDiv>
          <Loading />
          {message && <MedText>{message} Redirecting...</MedText>}
        </BigDiv>
      );
    }
    if (redirect) {
      return <Redirect to={`/location/${location_id}`} />;
    }
    if (message) {
      return (
        <BigDiv>
          <MedText>{message}</MedText>
        </BigDiv>
      );
    }
    return (
      <BigDiv>
        <ReviewForm onSubmit={this.addReview}>
          <Label htmlFor="placename">Location name:</Label>
          <PlaceInput type="text" name="placename" value={placename} onChange={this.handleChange} />
          <Label htmlFor="text">Your review:</Label>
          <TextInput
            type="text"
            name="text"
            value={text}
            onChange={this.handleChange}
            placeholder=" review text"
          />

          <Label htmlFor="stars">Your stars (0-5):</Label>
          <Score type="text" name="stars" value={stars} onChange={this.handleChange} />

          <Button type="submit">Submit Review</Button>
        </ReviewForm>
      </BigDiv>
    );
  }
}

export default AddReview;
