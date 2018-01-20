import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';

import Loading from '../utils/Loading';
import { BigDiv, MedText, Avatar } from '../utils/shared-styles';
import Review from './Review/Review';
import blankAvatar from '../utils/avatar-blank.jpg';

axios.defaults.headers.post['Content-Type'] = 'application/json';

const Left = styled.div`
  max-height: 200px;
  align-self: flex-start;
  padding: 4em 0em 0em 1em;
`;

const RevWrap = styled.div`
  padding: 1rem;
  margin: 1rem;
  width: 50%;
`;

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      loading: true,
    };
  }

  componentWillMount() {
    this.getUser();
  }

  getUser = () => {
    const { user_id } = this.props.match.params;
    const userQuery = `
    query {
      user(_id:"${user_id}") {
        avatar
        username
        registered
        reviews {
          location {
            _id
            placename
          }
          _id
          text
          stars
          posted
        }
      }
    }`;

    axios.post('/graphql', { query: userQuery }).then((response) => {
      this.setState({ user: response.data.data.user, loading: false });
    });
  };

  handleDelete = (e) => {
    e.preventDefault();
    const _id = e.target.name;
    if (!_id) return null;
    const deleteReview = `
      mutation {
        deleteReview(review_id:"${_id}") {
          _id
        }
      }
    `;
    return axios
      .post('/graphql', { query: deleteReview })
      .then(() => this.getUser())
      .catch(err => this.messager(`deleting error: ${err}`));
  };

  render() {
    const { loading } = this.state;
    if (loading || !this.state.user) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Loading />
        </BigDiv>
      );
    }
    const {
      avatar, username, registered, reviews,
    } = this.state.user;
    return (
      <BigDiv>
        <Left>
          <Avatar src={avatar || blankAvatar} alt="user avatar" />
          <MedText>{username}</MedText>
          <p>Member since {new Date(registered).toDateString()}</p>
        </Left>
        <RevWrap>
          {reviews.length > 0 &&
            reviews.map((rev, i) => (
              <Review handleDelete={this.handleDelete} key={rev._id} rev={rev} />
            ))}
        </RevWrap>
      </BigDiv>
    );
  }
}

User.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
};

export default User;
