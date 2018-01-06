import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Stars from 'simple-rating-stars';
import { Link } from 'react-router-dom';

const RecentWrap = styled.div`
  margin-top: 4em;
  height: 16em;
  width: 100%;
  background: #fff;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

const RecentRowItem = styled.div`
  height: 14em;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
`;

const Item = styled.div`
  background: #eee;
  padding: 0.5em;
  border-radius: 6px;
  margin: 1em;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  min-width: 140px;
  max-width: 180px;
  height: 160px;
  font-size: 0.75em;
`;

class Recents extends React.Component {
  state = {
    recents: null,
  };

  componentDidMount() {
    const num = 5;
    const getRecentsQuery = `
      query {
        getRecents(num: "${num}") {
          text
          stars
          posted
          user {
            _id
            username
          }
          location {
            _id
            placename
          }
        }
      }
    `;

    axios
      .post('/graphql', { query: getRecentsQuery })
      .then(response => this.setState({ recents: response.data.data.getRecents }))
      .catch(e => console.log(e));
  }

  renderRecents = array =>
    array.map((a) => {
      const shortened = a.text.length > 80 ? `${a.text.substring(0, 80)}...` : a.text;
      return (
        <Item key={a.posted}>
          <p>
            <Link to={`/location/${a.location._id}`}>{a.location.placename}</Link>
          </p>
          <Stars
            stars={parseInt(a.stars, 10)}
            outOf={5}
            full="#134999"
            empty="#fff"
            stroke="#000"
          />
          <p>{shortened}</p>
          <p style={{ justifySelf: 'flex-end' }}>
            ~ <Link to={`/user/${a.user._id}`}>{a.user.username}</Link>,{' '}
            {new Date(a.posted).toDateString()}
          </p>
        </Item>
      );
    });

  render() {
    const { recents } = this.state;
    return (
      <RecentWrap>
        <p>some recent reviews...</p>
        <RecentRowItem>{recents && this.renderRecents(recents)}</RecentRowItem>
      </RecentWrap>
    );
  }
}

export default Recents;
