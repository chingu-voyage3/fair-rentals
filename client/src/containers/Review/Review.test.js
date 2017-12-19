/* eslint-disable no-undef */
import React from 'react';
import renderer from 'react-test-renderer';
import expect from 'expect';
import Review from './Review';

const rev = {
  id: 222,
  user_id: 111,
  text: 'Cheap and friendly.',
  stars: 4,
};

describe('Review displays a review', () => {
  let tree;
  beforeAll(() => {
    const component = renderer.create(<Review key={rev.id} rev={rev} index={0} />);
    tree = component.toJSON();
  });
  it('should render', () => {
    expect(tree).toMatchSnapshot();
  });

  it('should include 3 children', () => {
    // check length
    expect(tree.children.length).toBe(3);
    // check the first one's class
    expect(tree.children[0].props.className).toEqual('top-line');
    // check the second one's text
    expect(tree.children[1].children[0]).toEqual('Cheap and friendly.');
    // 3rd child is Stars, which has its own tests. but check it's a <div>
    expect(tree.children[2].type).toBe('div');
  });
});
