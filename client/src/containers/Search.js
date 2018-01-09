import React from 'react';
import { geolocated } from 'react-geolocated';
import PropTypes from 'prop-types';
import axios from 'axios';

import Loading from '../utils/Loading';
import { BigText, BigDiv } from '../utils/shared-styles';

axios.defaults.headers.post['Content-Type'] = 'application/json';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      options: [],
      loading: false,
    };
  }

  handleSubmit = (e) => {};

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
    const { latitude = 40, longitude = -90 } = this.props.coords; // destructuring + defaults if coords unavail
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
              name: p.description,
              id: p.place_id,
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
    const { input, loading, options } = this.state;
    if (loading) return <Loading />;
    return (
      <BigDiv>
        <BigText>Search</BigText>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="input">
            <input type="text" name="input" value={input} onChange={this.handleChange} />
            <select name="selector">
              {options.map(o => <option key={o.id}>{o.name}</option>)}
            </select>
          </label>
          <input type="submit" />
        </form>
      </BigDiv>
    );
  }
}

Search.propTypes = {
  coords: PropTypes.object, // eslint-disable-line
};

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(Search);
