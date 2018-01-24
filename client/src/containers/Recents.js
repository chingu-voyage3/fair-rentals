/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Stars from 'simple-rating-stars';
import { Link } from 'react-router-dom';

const RecentWrap = styled.div`
  width: 80%;
  margin: 1em 1em 4em 1em;
  text-align: center;
`;
const RecentRow = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  align-items: center;
  transition: 0.35s all;
  @media (max-width: 450px) {
    flex-flow: column nowrap;
    justify-content: flex-start;
    height: 1000px;
  }
`;

const Item = styled.div`
  background: white;
  padding: 0.5em;
  border-radius: 6px;
  margin: 1em;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 180px;
  height: 160px;
  font-size: 0.75em;
`;

class Recents extends React.Component {
  state = {
    recents: null,
  };

  componentDidMount() {
    this._mounted = true;
    this.getRecentItems();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getRecentItems = () => {
    const num = 8;
    const getRecentsQuery = `
      query {
        getRecents(num: ${num}) {
          text
          stars
          last_edited
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
      .then((response) => {
        if (this._mounted) {
          this.setState({ recents: response.data.data.getRecents });
        }
      })
      .catch(e =>
        this.setState({
          recents: [
            {
              text: 'Something went wrong',
              stars: 0,
              last_edited: 1,
              user: {
                username: 'The App',
                _id: 0,
              },
              location: {
                placename: 'The Internet',
                _id: 1,
              },
            },
          ],
        }));
  };

  renderRecents = array =>
    array.map((a) => {
      if (a === null) return null;
      const shorttext = a.text.length > 80 ? `${a.text.substring(0, 80)}...` : a.text;
      const shortname =
        a.user.username.length > 10 ? `${a.user.username.substring(0, 10)}...` : a.user.username;
      return (
        <Item key={a.last_edited}>
          <p>
            <Link to={`/location/${a.location._id}`}>{a.location.placename}</Link>
          </p>
          <Stars stars={a.stars} outOf={5} full="#185263" empty="#fff" stroke="#000" />
          <p>{shorttext}</p>
          <p style={{ alignSelf: 'flex-end' }}>
            ~ <Link to={`/user/${a.user._id}`}>{shortname}</Link>,{' '}
            {new Date(a.last_edited).toDateString()}
          </p>
        </Item>
      );
    });

  render() {
    const { recents } = this.state;
    return (
      <RecentWrap>
        <RecentRow>{recents && this.renderRecents(recents)}</RecentRow>
      </RecentWrap>
    );
  }
}

export default Recents;
