var expect = require('chai').expect
  , find = require('../../lib')
  , base = 'test/fixtures/mock';

function reject(path, info) {
  return false;
}

describe('fs-find:', function() {

  it('should error on bad symlink w/ followLinks', function(done) {
    find(['test/fixtures/bad-symlink'], {followLinks: true}, function(err, files) {
      function fn() {
        throw err;
      }
      expect(fn).throws(Error);
      expect(fn).throws(/ENOENT/);
      expect(fn).throws(/stat/);
      expect(fn).throws(/symlink.txt/);
      done();
    })
  });

});
