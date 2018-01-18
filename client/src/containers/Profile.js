import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';

import Review from './Review/Review';
import {
  BigDiv,
  MedText,
  Avatar,
  Left,
  RevWrap,
  Label,
  Button,
  CredentialForm,
  CredentialFormInput,
} from '../utils/shared-styles';
import blankAvatar from '../utils/avatar-blank.jpg';

axios.defaults.headers.post['Content-Type'] = 'application/json';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      avatar: '',
      registered: '',
      _id: '',
      reviews: '',
      message: '',
      fixedName: '',
      fixedAvi: '',
    };
  }

  componentWillMount() {
    this.getUserFromStorage();
    this.getReviews();
  }

  getReviews = () => {
    const _id = sessionStorage.getItem('_id');
    const userQuery = `
    query {
      user(_id:"${_id}") {
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
      this.setState({ reviews: response.data.data.user.reviews });
    });
  };

  getUserFromStorage = () => {
    const username = sessionStorage.getItem('username');
    const avatar = sessionStorage.getItem('avatar');
    const registered = parseInt(sessionStorage.getItem('registered'), 10);
    const _id = sessionStorage.getItem('_id');
    this.setState({
      fixedName: username,
      fixedAvi: avatar,
      username,
      avatar,
      registered,
      _id,
    });
  };
  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
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
      .then(() => this.getReviews())
      .catch(err => this.messager(`deleting error: ${err}`));
  };
  submit = (e) => {
    e.preventDefault();
    const { username, avatar, _id } = this.state;
    if (username === '' || typeof username !== 'string' || username.length > 40) {
      this.setState({ message: "Let's work on that name." });
      return setTimeout(() => {
        this.setState({ message: '' });
      }, 2000);
    }
    // TODO: editUser mutation doesn't exist yet
    const graphQLEditUser = `
    mutation {
      editUser(
        input: {
          username: "${username}",
          avatar: "${avatar}",
          _id: "${_id}"
        }
      ) {
          username,
          avatar,
          registered
          _id
        }
      }
    `;
    return axios.post('/graphql', { query: graphQLEditUser }).then((response) => {
      this.props.auth.setMongoSession(response.data.data.editUser);
      this.getUserFromStorage();
    });
  };
  render() {
    const {
      username, avatar, registered, _id, message, fixedName, fixedAvi, reviews,
    } = this.state;
    return (
      <BigDiv>
      <Helmet>
        <title>{`${username}'s Profile`}</title>
      </Helmet>
        <Left>
          <Avatar src={fixedAvi || blankAvatar} alt="user avatar" />
          <MedText>
            <Link to={`/user/${_id}`}>{fixedName}</Link>
          </MedText>
          <p>Member since {new Date(registered).toDateString()}</p>
        </Left>
        <RevWrap>
          <CredentialForm onSubmit={this.submit}>
            <Label htmlFor="name">Username</Label>
            <CredentialFormInput
              type="text"
              name="username"
              value={username}
              onChange={this.handleChange}
            />
            <p />
            <Label htmlFor="avatar">Replace your avatar file?</Label>
            <CredentialFormInput
              type="avatar"
              name="avatar"
              value={avatar}
              onChange={this.handleChange}
              placeholder=""
            />
            <Button type="submit">Submit</Button>
            <p style={{ color: 'indianred' }}>{message}</p>
          </CredentialForm>
          {reviews.length > 0 &&
            reviews.map((rev, i) => (
              <Review
                handleDelete={this.handleDelete}
                the_reviewers_id={_id}
                key={rev._id}
                rev={rev}
                index={i}
              />
            ))}
        </RevWrap>
      </BigDiv>
    );
  }
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired, //eslint-disable-line
};

export default Profile;
