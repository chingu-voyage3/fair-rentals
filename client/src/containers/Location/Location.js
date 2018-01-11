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

  findExistingReview = (reviews) => {
    const user_id = localStorage.getItem('_id');
    if (!user_id || !reviews) return null;
    const userReview = reviews.filter(rev => rev.user._id === user_id)[0];
    return userReview || null;
  };

  render() {
    const { loading, location, existingReview } = this.state;
    const user_id = localStorage.getItem('_id');

    if (loading || !location) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Loading />
        </BigDiv>
      );
    }
    const { placename, reviews } = location;
    return (
      <BigDiv>
        <Left>
          <MedText>{placename}</MedText>
        </Left>
        {/* if logged in, AddReview component appears */}
        {user_id ? (
          <AddReview
            update={this.getLocationData}
            existingReview={existingReview}
            location_id={this.props.match.params.location_id}
          />
        ) : (
          <p>Log in to add your review of this location...</p>
        )}
        <RevWrap>{reviews.map((rev, i) => <Review key={rev._id} rev={rev} index={i} />)}</RevWrap>
      </BigDiv>
    );
  }
}

Location.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
};

export default Location;
