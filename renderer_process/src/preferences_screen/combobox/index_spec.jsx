import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { Combobox } from './';
import { Textfield } from '../textfield';

import classes from './combobox.css';

describe('Combobox', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Combobox/>);

    expect(wrapper.find(`.${classes.combobox}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.selectContainer}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.select}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.graphic}`)).to.have.length(1);
    expect(wrapper.find(Textfield)).to.have.length(1);
  });

  it('selecting option updates Textfield value', () => {
    // const onChangeStub = sandbox.stub();
    const wrapper = mount(
      <Combobox>
        <option className="first-option" value="foo">Foo</option>
        <option value="bar">Bar</option>
      </Combobox>
    );

    // wrapper.find(`.${classes.select}`).
    // wrapper.find('.first-option').simulate('click');

    wrapper.find('.first-option').simulate('click');

    console.log(wrapper.find(Textfield).props());
  });
});
