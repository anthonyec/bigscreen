import { expect } from 'chai';

import uid from './uid';

describe('UID generator', () => {
  it('generates incrementing number each time is called', () => {
    const uidResults = [];
    const expectedResults = [
      'id_1',
      'id_2',
      'id_3',
      'id_4',
      'id_5',
      'id_6',
      'id_7',
      'id_8',
      'id_9',
      'id_10',
    ];

    for (let i = 0; i < 10; i++) {
      const result = uid();
      uidResults.push(result);
    }

    expect(uidResults).to.eql(expectedResults);
  });

  it('had default prefix of "id"', () => {
    const result = uid();
    expect(result).to.equal('id_11');
  });

  it('can use custom prefix', () => {
    const result = uid('my_cool_id');

    // id is 11 because uid was called 11 times in previous tests.
    expect(result).to.equal('my_cool_id_12');
  });
});
