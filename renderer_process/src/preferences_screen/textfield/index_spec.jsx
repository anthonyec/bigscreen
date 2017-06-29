import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { Textfield } from './';

import classes from './textfield.css';

describe('Textfield', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Textfield/>);

    expect(wrapper.find(`.${classes.textfield}`)).to.have.length(1);
    expect(wrapper.find(`.${classes.input}`)).to.have.length(1);
  });

  it('changing fires onChange and setsState for value', () => {
    const onChangeStub = sandbox.stub();
    const wrapper = shallow(<Textfield onChange={ onChangeStub }/>);

    const input = wrapper.find(`.${classes.input}`);
    input.simulate('change', { target: { value: 'foo' } });

    expect(onChangeStub.calledOnce).to.equal(true);
    expect(onChangeStub.args[0][0]).to.eql({ target: { value: 'foo' } });
    expect(wrapper.state()).to.eql({ value: 'foo' });
  });

  it('when value prop changes it updates the value state', () => {
    const wrapper = shallow(<Textfield value="foo"/>);

    wrapper.setProps({ value: 'bar' });
    expect(wrapper.state()).to.eql({ value: 'bar' });
  });
});
