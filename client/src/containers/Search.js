import React from 'react';
import { geolocated } from 'react-geolocated';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import { BigText, MedText, BigDiv } from '../utils/shared-styles';

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
      message: '',
    };
  }
  messager = (message) => {
    setTimeout(() => {
      this.setState({ message: '' });
    }, 2000);
    return this.setState({ message });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    return false;
    // how to handle the form Submit, separate from a click on one of the options?
    // submit whatever's first on the current this.state.options array, maybe?
    // (and if none, return false)
    // UPDATE: weirdly, this seems to be the default behavior?
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
          return this.messager(res.errors);
        }
        return this.props.history.push(`/location/${res.data.data.createLocation._id}`);
      })
      .catch(err => this.messager(`Error adding new location: ${err}`));
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
        if (res.errors) return this.messager(res.errors);
        if (!res.data.data.locationGoogle) return this.create_new_location(place_id, placename);
        return this.props.history.push(`/location/${res.data.data.locationGoogle._id}`);
      })
      .catch(err => this.messager(`Error querying for location: ${err}`));
  };

  handleClick = (e) => {
    e.preventDefault();
    const place_id = e.target.id;
    const placename = e.target.value;
    this.submitPlace(place_id, placename);
  };

  handleChange = (e) => {
    e.preventDefault();
    const input = e.target.value.toString();
    this.setState({ [e.target.name]: input });
    if (input.length < 1) return null;
    const { latitude, longitude } = this.props.coords
      ? this.props.coords
      : { latitude: 30, longitude: -90 };
    const data = {
      input,
      latitude,
      longitude,
      radius: 20000,
    };
    return axios
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
            this.setState({ options: [] });
            return this.messager(`Autocomplete server error: ${servererror}`);
          }
        }
        // this next line should be unreachable, but just in case...
        return this.messager('Something went wrong with the autocomplete');
      })
      .catch(err => this.messager(`Autocomplete catch: ${err}`));
  };

  render() {
    const { input, options, message } = this.state;
    return (
      <BigDiv>
      <Helmet>
        <title>{`Location Search`}</title>
      </Helmet>
        <BigText>Search</BigText>
        <MedText>{message}</MedText>
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
