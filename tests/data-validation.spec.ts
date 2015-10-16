/// <reference path="../typings/tsd.d.ts" />

import chai = require('chai');
var expect = chai.expect;

var context = require('../src/data-validation');

describe('data-validation', () => {

  it('expose data in the context', () => {
    expect(context.DataValidation).to.not.be.undefined;
  });
});
