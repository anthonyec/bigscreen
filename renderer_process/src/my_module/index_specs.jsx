import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { MyComponent } from './index';

import classes from './my_module.css';

describe('MyModule', () => {
  it('should render correctly', () => {
    // WHEN
    const shallowWrapper = shallow(<MyComponent />);

    // THEN
    expect(shallowWrapper.find(`.${classes.wrap}`).text())
      .to.equal('Hello World! The base color is #ff0000');
  });
});
