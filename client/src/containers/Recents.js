/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Stars from 'simple-rating-stars';
import { Link } from 'react-router-dom';

const RecentWrap = styled.div`
  margin-top: 4em;
  min-height: 16em;
  width: 100%;
  background: #fff;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

const RecentRowItem = styled.div`
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  transition: 0.35s all;
  @media (max-width: 450px) {
    flex-flow: column nowrap;
    justify-content: flex-start;
    height: 1000px;
  }
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
  @media (max-width: 450px) {
    flex-flow: column nowrap;
    justify-content: flex-start;
  }
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
    const num = 5;
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
      const shortened = a.text.length > 80 ? `${a.text.substring(0, 80)}...` : a.text;
      return (
        <Item key={a.last_edited}>
          <p>
            <Link to={`/location/${a.location._id}`}>{a.location.placename}</Link>
          </p>
          <Stars stars={a.stars} outOf={5} full="#134999" empty="#fff" stroke="#000" />
          <p>{shortened}</p>
          <p style={{ justifySelf: 'flex-end' }}>
            ~ <Link to={`/user/${a.user._id}`}>{a.user.username}</Link>,{' '}
            {new Date(a.last_edited).toDateString()}
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
