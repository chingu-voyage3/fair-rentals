import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Stars from 'simple-rating-stars';
import styled from 'styled-components';

const RevWrap = styled.div`
  border-radius: 4px;
  padding: 0.25rem 1rem;
  margin: 0.5rem;
  background: #eee;
  border: 1px solid #999;
  font-family: 'Slabo 27px', Helvetica, sans-serif;
`;

const TopLine = styled.p`
  font-style: italic;
`;

const RevText = styled.p`
  font-size: 1rem;
`;

const PostedText = styled.p`
  font-size: 0.8rem;
  text-align: right;
  color: grey;
`;

const DeleteButton = styled.button`
  color: #eee;
  font-size: 0.8rem;
  border: none;
  border-radius: 6px;
  background: indianred;
  padding-bottom: 2px;
  float: right;
  cursor: pointer;
`;

class Review extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user_id: null };
  }

  componentWillMount() {
    try {
      const user_id = sessionStorage.getItem('_id');
      return this.setState({ user_id });
    } catch (e) {
      return null;
    }
  }

  render() {
    const { rev, the_reviewers_id, handleDelete } = this.props;
    const { user_id } = this.state;
    let topLine;
    let linkTo;
    if (rev.location) {
      topLine = rev.location.placename;
      linkTo = `/location/${rev.location._id}`;
    } else if (rev.user) {
      topLine = `${rev.user.username}, member since ${new Date(rev.user.registered).toDateString()}`;
      linkTo = `/user/${rev.user._id}`;
    }
    return (
      <RevWrap>
        <TopLine>
          <Link to={linkTo}>{topLine}</Link>
          {/* if logged in AND it's your review, delete button appears */}
          {user_id &&
            the_reviewers_id === user_id && (
              <DeleteButton name={rev._id} onClick={handleDelete}>
                delete
              </DeleteButton>
            )}
        </TopLine>
        <Stars stars={rev.stars} outOf={5} full="#134999" empty="#fff" stroke="#000" />
        <RevText>{rev.text}</RevText>
        <PostedText>review posted {new Date(rev.posted).toDateString()}</PostedText>
      </RevWrap>
    );
  }
}

Review.propTypes = {
  the_reviewers_id: PropTypes.string,
  handleDelete: PropTypes.func.isRequired,
  rev: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    location: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      placename: PropTypes.string.isRequired,
    }),
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      registered: PropTypes.number.isRequired,
    }),
    text: PropTypes.string.isRequired,
    stars: PropTypes.number.isRequired,
    posted: PropTypes.number.isRequired,
  }).isRequired,
};

Review.defaultProps = {
  the_reviewers_id: null,
};

export default Review;
