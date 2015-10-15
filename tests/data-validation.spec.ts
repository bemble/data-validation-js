/// <reference path="../typings/tsd.d.ts" />

import chai = require('chai');
var expect = chai.expect;

(<any>global).window = {};
require('../src/data-validation');

describe('data-validation', () => {

  it('expose data in the context', () => {
    expect((<any>window).DataValidation).to.not.be.undefined;
  });
});
