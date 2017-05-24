import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(
      <Combobox>
        <option value="bar">Bar</option>
        <option className="first-option" value="foo">Foo</option>
      </Combobox>
    );

    expect(wrapper.find(`.${classes.combobox}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.selectContainer}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.select}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.graphic}`)).to.have.length(1);
    expect(wrapper.find(Textfield)).to.have.length(1);
    expect(wrapper.find('option')).to.have.length(2);
  });

  it('handleTextfieldChange sets state to target value', () => {
    const wrapper = shallow(<Combobox/>);
    const instance = wrapper.instance();

    instance.handleTextfieldChange({ target: { value: 'bar' } });
    expect(wrapper.state()).to.eql({ value: 'bar' });
  });

  it('handleSelectChange sets state to target value', () => {
    const wrapper = shallow(
      <Combobox>
        <option value="bar">Bar</option>
        <option className="first-option" value="foo">Foo</option>
      </Combobox>
    );
    const instance = wrapper.instance();

    instance.handleSelectChange({ target: { value: 'foo' } });
    expect(wrapper.state()).to.eql({ value: 'foo' });
  });
});
