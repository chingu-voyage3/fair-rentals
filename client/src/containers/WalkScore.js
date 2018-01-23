import React from 'react';



class WalkScore extends React.Component {

  render () {
    const { score } = this.props;
    return (
      <div>
        <a rel="noopener noreferrer" target="_blank" href="https://www.walkscore.com/how-it-works/">
         Walk Score® </a> : {score}
      </div>
    );
  }
}

export default WalkScore;
