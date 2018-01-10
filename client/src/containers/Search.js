import React from 'react';
import { geolocated } from 'react-geolocated';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';

import { BigText, BigDiv } from '../utils/shared-styles';

const SearchForm = styled.form`
  width: 60%;
  min-width: 440px;
  height: 400px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
`;

const SearchInput = styled.input`
  font-size: 1.25em;
  width: 85%;
  height: 1.5em;
`;

const OneOption = styled.button`
  font-size: 1.1em;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.25em 0.125em 0.25em 0.125em;
  color: #222;
  cursor: pointer;
  &:hover,
  &:focus {
    color: #eee;
    background-color: #222;
  }
`;

const OptionWrap = styled.div`
  width: 85%;
  border: 1px solid black;
`;
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      options: [],
    };
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    return false;
    // how to handle the form Submit, separate from a click on one of the options?
    // submit whatever's first on the current this.state.options array, maybe?
    // (and if none, return false)
  };

  submitPlace = (place_id, placename) => {
    this.check_for_existing(place_id, placename);
  };

  create_new_location = (place_id, placename) => {
    const mutation = `
    mutation {
      createLocation(place_id: "${place_id}", placename: "${placename}") {
        _id
      }
    }`;
    axios
      .post('/graphql', { query: mutation })
      .then((res) => {
        if (res.errors) {
          return console.log(res.errors);
        }
        return this.props.history.push(`/location/${res.data.data.createLocation._id}`);
      })
      .catch((err) => {
        console.log('Error adding new location', err);
      });
  };

  check_for_existing = (place_id, placename) => {
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
        if (res.errors) {
          return console.log(res.errors); // terrible error handling
        }
        if (!res.data.data.locationGoogle._id) {
          return this.create_new_location(place_id, placename);
        }
        return this.props.history.push(`/location/${res.data.data.locationGoogle._id}`);
      })
      .catch(err => console.log('Error querying for location', err));
  };

  handleClick = (e) => {
    e.preventDefault();
    const place_id = e.target.id;
    const placename = e.target.value;
    this.submitPlace(place_id, placename);
  };

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
    let latitude = 40;
    let longitude = -90;
    // can't figure a better way to deal with delay of coords populating
    if (this.props.coords) {
      latitude = this.props.coords.latitude;
      longitude = this.props.coords.longitude;
    }
    const data = {
      input: e.target.value.toString(),
      latitude,
      longitude,
      radius: 2000000,
    };
    axios
      .post('/autocomplete', { data })
      .then((response) => {
        if (response.status === 200) {
          try {
            const placesObj = response.data.json.predictions.map(p => ({
              longname: p.description,
              placename: p.structured_formatting.main_text,
              place_id: p.place_id,
            }));
            return this.setState({ options: placesObj });
          } catch (servererror) {
            return this.setState({ options: [] }); // error message on page, instead?
          }
        }
        return null; // error message here too?
      })
      .catch(err => console.log(err)); // and here too? 'network error' notice?
  };

  render() {
    const { input, options } = this.state;
    return (
      <BigDiv>
        <BigText>Search</BigText>
        <SearchForm onSubmit={this.handleFormSubmit}>
          <SearchInput type="text" name="input" value={input} onChange={this.handleChange} />
          {options.length > 0 && (
            <OptionWrap>
              {options.map(a => (
                <OneOption
                  key={a.place_id}
                  id={a.place_id}
                  value={a.placename}
                  onClick={this.handleClick}
                >
                  {a.longname}
                </OneOption>
              ))}
            </OptionWrap>
          )}
          <input style={{ visibility: 'hidden' }} type="submit" />
        </SearchForm>
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
