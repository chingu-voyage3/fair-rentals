import React from 'react';
import PropTypes from 'prop-types';

import SearchForm from './SearchForm';
import { BigText, BigDiv } from '../../utils/shared-styles';

import './search.css';

class Search extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     future: true, // just to shut up linter until we put search in
  //   };
  // }
  render() {
    return (
      <BigDiv>
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
