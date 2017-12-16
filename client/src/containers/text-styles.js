import styled from 'styled-components';

export const BigText = styled.p`
  font-size: 4rem;
  /* padding: 0;
  margin: 0; */
`;

export const MedText = styled.p`
  font-size: 2rem;
  /* padding: 0;
  margin: 0; */
`;

export const UserDiv = styled.div`
  height: 1vh;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin: 0.5rem 2rem;
  align-items: center;
`;

export const BigDiv = styled.div`
  height: 80vh;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  background-image: linear-gradient(180deg, #efefef 10%, #efefef 70%, steelblue);
`;
