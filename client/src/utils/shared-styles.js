import styled from 'styled-components';

export const BigText = styled.p`
  font-size: 4rem;
`;

export const MedText = styled.p`
  font-size: 2rem;
`;

export const BigDiv = styled.div`
  min-height: 80vh;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  background: none;
  @media (max-width: 450px) {
    height: 100%;
  }
`;

export const Left = styled.div`
  max-height: 150px;
  align-self: flex-start;
  padding: 3em 0em 0em 1em;
`;

export const LittleLeft = styled.div`
  align-self: flex-start;
  padding: 1em 0em 0em 1em;
`;

export const RevWrap = styled.div`
  padding: 1rem;
  margin: 1rem;
  width: 50%;
`;

export const Avatar = styled.img`
  height: 4rem;
  width: 4rem;
  border-radius: 25%;
`;

export const Button = styled.button`
  border: 1px solid black;
  border-radius: 6px;
  padding: 0.25rem 0.5rem 0.3rem 0.5rem;
  margin-top: 2rem;
  font-size: 0.875rem;
  cursor: pointer;
  min-height: 2em;
`;
