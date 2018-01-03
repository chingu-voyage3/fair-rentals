import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
// import axios from 'axios';

import Loading from '../utils/Loading';
import { BigDiv, MedText, Avatar } from '../utils/shared-styles';
import Review from './Review/Review';
import blankAvatar from '../utils/avatar-blank.jpg';

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

const tempReviews = [
  {
    id: 1,
    user_id: 9999999,
    location_id: 1,
    location_name: 'Bills Apartments',
    text: "Nice place to visit but I wouldn't wanna live here.",
    stars: 2,
  },
  {
    id: 2,
    user_id: 9999999,
    location_id: 2,
    location_name: 'Brads House',
    text:
      "The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    stars: 1,
  },
  {
    id: 3,
    location_id: 3,
    location_name: 'The Omni',
    user_id: 9999999,
    text:
      "The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    stars: 4,
  },
];
class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      loading: true,
      userReviews: [],
    };
  }

  componentWillMount() {
    // axios GET to get user from passed down id on props
    setTimeout(() => {
      this.setState({
        user: {
          id: 9999999,
          name: 'Mock User',
          reviews: [1, 2, 3],
          avatar: blankAvatar,
          registered: new Date('<2017-12-12>'),
        },
        loading: false,
      });
    }, 1000);
    // axios GET to take user.reviews array and db.find() each of them.
    setTimeout(() => {
      this.setState({ userReviews: tempReviews });
    }, 1000);
  }
  componentWillUnmount() {}
  render() {
    const { loading, userReviews, user } = this.state;
    if (loading || !user) {
      return (
        <BigDiv style={{ paddingTop: '10rem' }}>
          <Loading />
        </BigDiv>
      );
    }
    const { avatar, name, registered } = user;
    return (
      <BigDiv>
        <Left>
          <Avatar src={avatar} alt="user avatar" />
          <MedText>{name}</MedText>
          <p>Member since {registered.toDateString()}</p>
        </Left>
        <RevWrap>
          {userReviews.length > 0 &&
            userReviews.map((rev, i) => <Review key={rev.id} rev={rev} index={i} />)}
        </RevWrap>
      </BigDiv>
    );
  }
}

// User.propTypes = {
//   user: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     name: PropTypes.string.isRequired,
//     reviews: PropTypes.array.isRequired,
//     avatar: PropTypes.string.isRequired,
//     registered: PropTypes.string.isRequired,
//   }).isRequired,
// };

export default User;
