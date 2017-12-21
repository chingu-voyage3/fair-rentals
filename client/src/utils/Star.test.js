/* eslint-disable no-undef */
import React from 'react';
import renderer from 'react-test-renderer';
import expect from 'expect';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Star from './Star';

configure({ adapter: new Adapter() });

const numOfStars = 3;

describe('Star renders stars', () => {
  let tree;
  beforeAll(() => {
    const component = renderer.create(<Star number={numOfStars} />);
    tree = component.toJSON();
  });
  it('should render', () => {
    expect(tree).toMatchSnapshot();
  });

  it('should have 5 SVG inside div', () => {
    const stars = shallow(<Star number={3} />);
    expect(stars.find('div').children()).toHaveLength(5);
  });
  it('stars should be filled correctly', () => {
    expect(tree.children[numOfStars - 1].props.fill).toEqual('steelblue');
    expect(tree.children[numOfStars].props.fill).toEqual('#efefef');
  });
});

//     expect(stars.find('div').children()).toHaveLength(5);
