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
