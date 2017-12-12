import React from 'react';
import PropTypes from 'prop-types';

import SearchForm from '../containers/SearchForm';
import { BigText, UserDiv, BigDiv } from '../containers/text-styles';

import './search.css';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      future: true, // just to shut up linter until we put search in
    };
  }
  render() {
    const { user } = this.props;
    const { future } = this.state;
    return (
      <BigDiv>
        {future && user && <UserDiv>Welcome, {user.name}</UserDiv>}
        <BigText id="mobile-search">Search</BigText>
        <SearchForm />
      </BigDiv>
    );
  }
}

Search.propTypes = {
  user: PropTypes.string,
};

Search.defaultProps = {
  user: null,
};

export default Search;
