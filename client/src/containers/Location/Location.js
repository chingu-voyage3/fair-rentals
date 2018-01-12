import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import AddReview from '../AddReview/AddReview';
import Review from '../Review/Review';
import Loading from '../../utils/Loading';
import { BigDiv, MedText, Left, RevWrap } from '../../utils/shared-styles';

import './location.css';

class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      loading: true,
      existingReview: null,
      message: '',
    };
  }
  componentWillMount() {
    this.getLocationData();
  }

  getLocationData = () => {
    const { location_id } = this.props.match.params;
    const query = `
    query {
      location(_id:"${location_id}") {
        placename
        reviews(sort:"latest") {
          user {
            _id
            username
            registered
          }
          _id
          text
          stars
          posted
        }
      }
    }
    `;
    axios.post('/graphql', { query }).then(async (response) => {
      const { location } = response.status === 200 ? response.data.data : {};
      const existingReview = await this.findExistingReview(location.reviews);
      this.setState({ location: response.data.data.location, existingReview, loading: false });
    });
  };

  messager = (message) => {
    setTimeout(() => {
      this.setState({ message: '' });
    }, 2000);
    return this.setState({ message, loading: false });
  };

  findExistingReview = (reviews) => {
    const user_id = localStorage.getItem('_id');
    if (!user_id || !reviews) return null;
    const userReview = reviews.filter(rev => rev.user._id === user_id)[0];
    return userReview || null;
  };

  addReview = async (text, stars, review_id) => {
    this.setState({ loading: true });
    const { location_id } = this.props.match.params;
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
          this.messager('Done!');
          // const returnedId = response.data.data.editReview
          //   ? response.data.data.editReview._id
          //   : response.data.data.createReview._id;
          return this.getLocationData();
        }
        return this.setState({ loading: false }, () => this.messager('Something fouled up'));
      })
      .catch(e => this.messager(`something went wrong: ${e}`));
  };

  handleDelete = (e) => {
    e.preventDefault();
    const _id = e.target.name;
    if (!_id) return null;
    this.setState({ loading: true });
    const deleteReview = `
      mutation {
        deleteReview(review_id:"${_id}") {
          _id
        }
      }
    `;
    return axios
      .post('/graphql', { query: deleteReview })
      .then(() => {
        this.messager('Successfully deleted your review.');
        this.getLocationData();
      })
      .catch(err => this.messager(`deleting error: ${err}`));
  };

  render() {
    const {
      loading, location, existingReview, message,
    } = this.state;
    const user_id = localStorage.getItem('_id');
    const { placename, reviews } = location;

    if (message.length) {
      return (
        <BigDiv>
          <MedText>{message}</MedText>
        </BigDiv>
      );
    }
    if (loading || !location) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Loading />
        </BigDiv>
      );
    }

    return (
      <BigDiv>
        <Left>
          <MedText>{placename}</MedText>
        </Left>
        {/* if logged in, AddReview component appears */}
        {user_id ? (
          <AddReview
            addReview={this.addReview}
            messager={this.messager}
            handleDelete={this.handleDelete}
            update={this.getLocationData}
            existingReview={existingReview}
            location_id={this.props.match.params.location_id}
          />
        ) : (
          <p>Log in to add your review of this location...</p>
        )}
        <RevWrap>
          {reviews.map((rev, i) => (
            <Review
              handleDelete={this.handleDelete}
              the_reviewers_id={rev.user._id}
              key={rev._id}
              rev={rev}
              index={i}
            />
          ))}
        </RevWrap>
      </BigDiv>
    );
  }
}

Location.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
};

export default Location;
