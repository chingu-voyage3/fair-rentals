import React from 'react';
import { NavLink } from 'react-router-dom';

import './splash.css';

import { BigText, MedText, BigDiv } from '../../utils/shared-styles';

const Splash = () => (
  <BigDiv>
    <BigText id="mobile-title">Fair Rents</BigText>
    <MedText id="mobile-sub">Rent reviews for and by renters</MedText>
    <NavLink id="big-link" to="/search">
      Search for a property now
    </NavLink>
  </BigDiv>
);
// class Splash extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       user: null,
//     };
//   }
//   render() {
//     return (
//       <BigDiv>
//         <BigText id="mobile-title">Fair Rents</BigText>
//         <MedText id="mobile-sub">Rent reviews for and by renters</MedText>
//         <NavLink id="big-link" to="/search">
//           Search for a property now
//         </NavLink>
//       </BigDiv>
//     );
//   }
// }

export default Splash;
