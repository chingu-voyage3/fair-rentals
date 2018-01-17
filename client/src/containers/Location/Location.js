/* eslint-disable no-plusplus, no-console */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import AddReview from '../AddReview/AddReview';
import Review from '../Review/Review';
import Loading from '../../utils/Loading';
import { BigDiv, MedText, Left, RevWrap } from '../../utils/shared-styles';

import './location.css';

const PAGE_LENGTH = 5;

const PrevPageButton = styled.button`
  text-align: center;
  display: inline-block;
  font: 1.125em 'Slabo 27px', Helvetica, sans-serif;
  color: #334751;
  background-color: #eee;
  border-radius: 15px 5px 5px 15px;
`;

const NextPageButton = styled.button`
  text-align: center;
  display: inline-block;
  font: 1.125em 'Slabo 27px', Helvetica, sans-serif;
  color: #334751;
  background-color: #eee;
  border-radius: 5px 15px 15px 5px;
  padding-right: 20px;
`;

const SortDiv = styled.div`
  margin-top: 1em;
`;

const SortA = styled.a`
  color: ${props => (props.active ? 'white' : 'black')};
  background: ${props => (props.active ? 'black' : 'none')};
  border: 1px solid black;
  cursor: pointer;
  padding: 1px 4px 1px 4px;
  margin-left: .5em;
  border-radius: 6px;
`;

const PaginationBtnWrap = styled.span`
  padding-bottom: 2em;
`;

class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {},
      loading: true,
      existingReview: null,
      message: '',
      multiplePages: false,
      reviews: [],
      reviewCounter: 0,
      howSorted: 'latest', // enum: 'latest', 'oldest', 'best', 'worst'
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
      if (location.reviews.length > PAGE_LENGTH) {
        const tempReviews = [];
        for (let i = 0; i < PAGE_LENGTH; i++) {
          tempReviews.push(location.reviews[i]);
        }
        this.setState({
          location, existingReview, loading: false, multiplePages: true, reviews: tempReviews,
        });
      } else {
        this.setState({
          location, existingReview, loading: false, reviews: location.reviews,
        });
      }
    });
  };

  PrevPageHandler = () => {
    if (!this.state.multiplePages || this.state.reviewCounter === 0 ) {
      return;
    }
    const tempReviews = [];
    for (let i = (this.state.reviewCounter - PAGE_LENGTH); i < this.state.reviewCounter; i++) {
      if (this.state.location.reviews[i]) {
        tempReviews.push(this.state.location.reviews[i]);
      }
    }
    return this.setState({
      reviews: tempReviews,
      reviewCounter: (this.state.reviewCounter - PAGE_LENGTH),
    });
  };

  NextPageHandler = () => {
    if (!this.state.multiplePages || this.state.reviewCounter >= (this.state.location.reviews.length - PAGE_LENGTH) ) {
      return;
    }
    const tempReviews = [];
    for (
      let i = (this.state.reviewCounter + PAGE_LENGTH);
      i < (this.state.reviewCounter + (PAGE_LENGTH * 2));
      i++
    ) {
      if (this.state.location.reviews[i]) {
        tempReviews.push(this.state.location.reviews[i]);
      }
    }
    return this.setState({
      reviews: tempReviews,
      reviewCounter: (this.state.reviewCounter + PAGE_LENGTH),
    });
  };

  LatestSort = () => {
    const { location } = this.state;
    location.reviews.sort((a,b) => {
      return b.posted - a.posted;
    });

    if (this.state.multiplePages) {
      let tempReviews = [];
      for (let i = 0; i < PAGE_LENGTH; i++) {
        tempReviews.push(location.reviews[i]);
      }
      return this.setState({ location: location, reviews: tempReviews, reviewCounter: 0, howSorted: "latest" });
    }
    return this.setState({ location: location, reviews: location.reviews, reviewCounter: 0, howSorted: "latest" });
  };

  OldestSort = () => {
    const { location } = this.state;
    location.reviews.sort((a,b) => {
      return a.posted - b.posted;
    });

    if (this.state.multiplePages) {
      let tempReviews = [];
      for (let i = 0; i < PAGE_LENGTH; i++) {
        tempReviews.push(location.reviews[i]);
      }
      return this.setState({ location: location, reviews: tempReviews, reviewCounter: 0, howSorted: "oldest" });
    }
    return this.setState({ location: location, reviews: location.reviews, reviewCounter: 0, howSorted: "oldest" });
  };

  BestSort = () => {
    const { location } = this.state;
    location.reviews.sort((a,b) => {
      return b.stars - a.stars;
    });

    if (this.state.multiplePages) {
      let tempReviews = [];
      for (let i = 0; i < PAGE_LENGTH; i++) {
        tempReviews.push(location.reviews[i]);
      }
      return this.setState({ location: location, reviews: tempReviews, reviewCounter: 0, howSorted: "best" });
    }
    return this.setState({ location: location, reviews: location.reviews, reviewCounter: 0, howSorted: "best" });
  };

  WorstSort = () => {
    const { location } = this.state;
    location.reviews.sort((a,b) => {
      return a.stars - b.stars;
    });

    if (this.state.multiplePages) {
      let tempReviews = [];
      for (let i = 0; i < PAGE_LENGTH; i++) {
        tempReviews.push(location.reviews[i]);
      }
      return this.setState({ location: location, reviews: tempReviews, reviewCounter: 0, howSorted: "worst" });
    }
    return this.setState({ location: location, reviews: location.reviews, reviewCounter: 0, howSorted: "worst" });
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
      loading, location, existingReview, message, reviews,
    } = this.state;
    const user_id = localStorage.getItem('_id');
    const { placename } = location;

    if (message.length) {
      return (
        <BigDiv>
          <Helmet>
            <title>{`Fair Reviews`}</title>
          </Helmet>
          <MedText>{message}</MedText>
        </BigDiv>
      );
    }
    if (loading || !location) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Helmet>
            <title>{`Fair Reviews`}</title>
          </Helmet>
          <Loading />
        </BigDiv>
      );
    }

    return (
      <BigDiv>
        <Helmet>
          <title>{`${placename} Reviews`}</title>
        </Helmet>
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
        <SortDiv>
          {`Sort By
        `}
          <SortA active={this.state.howSorted === 'latest'} onClick={this.LatestSort}>Latest</SortA>
          <SortA active={this.state.howSorted === 'oldest'} onClick={this.OldestSort}>Oldest</SortA>
          <SortA active={this.state.howSorted === 'best'} onClick={this.BestSort}>Best</SortA>
          <SortA active={this.state.howSorted === 'worst'} onClick={this.WorstSort}>Worst</SortA>
        </SortDiv>
        <RevWrap>
          {reviews.map((rev, i) => (
            <Review
              handleDelete={this.handleDelete}
              the_reviewers_id={rev.user._id}
              key={rev._id}
              rev={rev}
            />
          ))}
        </RevWrap>
        {this.state.multiplePages &&
        <PaginationBtnWrap>
          <PrevPageButton onClick={this.PrevPageHandler}>&#8249; Previous</PrevPageButton>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <NextPageButton onClick={this.NextPageHandler}>Next &#8250;</NextPageButton>
        </PaginationBtnWrap>
        }
      </BigDiv>
    );
  }
}

Location.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
};

export default Location;
