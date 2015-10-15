var chai = require('chai');
var expect = chai.expect;
global.window = {};
require('../src/data-validation');
describe('data-validation', function () {
    it('expose data in the context', function () {
        expect(window.DataValidation).to.not.be.undefined;
    });
});
//# sourceMappingURL=data-validation.spec.js.map