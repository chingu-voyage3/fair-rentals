import React from 'react';

import { BigDiv } from '../utils/shared-styles';
import Pic404 from '../utils/pic404.jpg';

class FourOhFour extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <BigDiv>
        <p>You found it. The 404.</p>
        <img style={{ height: '20em', borderRadius: '10%' }} src={Pic404} alt="power equipment with the number 404" />
      </BigDiv>
    );
  }
}

export default FourOhFour;
