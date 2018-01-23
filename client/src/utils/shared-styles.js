import styled from 'styled-components';

export const BigText = styled.p`
  font-size: 4rem;
`;

export const MedText = styled.p`
  font-size: 2rem;
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
  @media (max-width: 450px) {
    height: 100%;
  }
`;

export const Left = styled.div`
  max-height: 200px;
  align-self: flex-start;
  padding: 4em 0em 0em 1em;
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

export const Label = styled.label`
  padding: 0.25rem;
`;

export const CredentialForm = styled.form`
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
`;

export const CredentialFormInput = styled.input`
  font: 1.125rem 'Slabo 27px', Helvetica, sans-serif;
  border: none;
  width: 30rem;
  max-width: 90%;
  text-align: center;
`;
