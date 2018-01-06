import React from 'react';
import Location from '../Location/Location';
import Loading from '../../utils/Loading';
// import axios from 'axios';

import './searchform.css';

// sample data
const mockedLocation = {
  id: 10000,
  name: 'Southgate North Apartments',
  avatar: 'http://cdn.freshome.com/wp-content/uploads/2007/10/tetris-apartments2.jpg',
  geo: { type: 'Point', coordinates: [-73.97, 40.77] },
  reviews: [
    {
      id: 222,
      reviewer_id: 111,
      reviewer_name: 'Bort',
      text: 'Cheap and friendly.',
      stars: 4,
    },
    {
      id: 333,
      reviewer_id: 101,
      reviewer_name: 'Bart',
      text:
        'A good deal but not very fancy. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ',
      stars: 3,
    },
  ],
};

class SearchForm extends React.Component {
  constructor() {
    super();
    this.state = {
      searchValue: '',
      input: '',
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {}

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true, searchValue: this.state.input, input: '' });
    // mocked search for a location
    setTimeout(() => {
      this.setState({ location: mockedLocation, loading: false });
    }, 1000);
  }

  handleChange(input) {
    this.setState({ input });
  }

  render() {
    if (this.state.loading) return <Loading />;
    const { searchValue, location } = this.state;
    return (
      <div className="form-wrap">
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="search">
            <input
              type="text"
              id="search"
              value={this.state.input}
              onChange={e => this.handleChange(e.target.value)}
            />
          </label>
          <input type="submit" />
        </form>
        {searchValue && <Location location={location} />}
      </div>
    );
  }
}

export default SearchForm;
