import React from 'react';
import { geolocated } from 'react-geolocated';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import GoogleMapComponent from './GoogleMap';
import { MedText, BigDiv } from '../utils/shared-styles';

const SearchMapContainer = styled.div`
  width: 80%;
  min-width: 440px;
  height: 500px;
`;

const LoadingNote = styled.p`
  color: indianred;
  font-size: 1.25em;
  text-align: center;
`;
class Search extends React.Component {
  create_new_location = (place_id, placename, geo, address) => {
    const mutation = `
    mutation {
      createLocation(place_id: "${place_id}",placename: "${placename}",address: "${address}",lat: "${geo.lat}",lon: "${geo.lon}") {
        _id
      }
    }`;
    console.log(mutation);
    axios
      .post('/graphql', { query: mutation })
      .then((res) => {
        if (res.errors) {
          return this.messager(res.errors);
        }
        return this.props.history.push(`/location/${res.data.data.createLocation._id}`);
      })
      .catch(err => console.log(`Error adding new location: ${err}`));
  };

  check_for_existing = (place_id, placename, geo, address) => {
    const query = `
    query {
      locationGoogle(place_id:"${place_id}") {
          _id
        }
      }
    `;
    axios
      .post('/graphql', { query })
      .then((res) => {
        if (res.errors) return this.messager(res.errors);
        if (!res.data.data.locationGoogle) return this.create_new_location(place_id, placename, geo, address);
        return this.props.history.push(`/location/${res.data.data.locationGoogle._id}`);
      })
      .catch(err => this.messager(`Error querying for location: ${err}`));
  };

  render() {
    const { latitude, longitude } = this.props.coords
      ? this.props.coords
      : { latitude: 30.0, longitude: -90 };
    return (
      <BigDiv>
        <Helmet>
          <title>Location Search</title>
        </Helmet>
        <MedText>Search</MedText>
        <p>Search for a location, then click its red map-marker to read or write a review.</p>
        <SearchMapContainer>
          {latitude !== 30.0 ? (
            <GoogleMapComponent
              latitude={latitude}
              longitude={longitude}
              handleClick={this.check_for_existing}
            />
          ) : (
            <LoadingNote>Map loading... this app requires your browser location.</LoadingNote>
          )}
        </SearchMapContainer>
      </BigDiv>
    );
  }
}

Search.propTypes = {
  coords: PropTypes.object, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
};

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(Search);
