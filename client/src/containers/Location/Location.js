import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

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
    };
  }
  componentWillMount() {
    const { location_id } = this.props.match.params;
    const locationQuery = `
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

    axios.post('/graphql', { query: locationQuery }).then((response) => {
      this.setState({ location: response.data.data.location, loading: false });
    });
  }

  render() {
    const { loading } = this.state;
    if (loading || !this.state.location) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Loading />
        </BigDiv>
      );
    }
    const { placename, reviews } = this.state.location;
    return (
      <BigDiv>
        <Left>
          <MedText>{placename}</MedText>
        </Left>
        <RevWrap>{reviews.map((rev, i) => <Review key={rev._id} rev={rev} index={i} />)}</RevWrap>
      </BigDiv>
    );
  }
}

Location.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
};

export default Location;
