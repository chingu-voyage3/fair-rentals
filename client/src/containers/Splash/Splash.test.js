/* eslint-disable no-undef */
import React from 'react';
import renderer from 'react-test-renderer';
import expect from 'expect';
import { BrowserRouter as Router } from 'react-router-dom';

import Splash from './Splash';

const jsxComponent = (
  <Router>
    <Splash />
  </Router>
);
describe('SplashComponent', () => {
  let tree;
  beforeAll(() => {
    const component = renderer.create(jsxComponent);
    tree = component.toJSON();
  });

  it('should render', () => {
    expect(tree).toMatchSnapshot();
  });

  it('should render "Fair Rents"', () => {
    expect(tree.children[0].children[0]).toEqual('Fair Rents');
  });
});
