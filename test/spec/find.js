var expect = require('chai').expect
  , find = require('../../lib');

describe('fs-find:', function() {

  it('should find files', function(done) {
    find([process.cwd() + '/test/fixtures/mock'], function(err, files) {
      if(err) {
        return done(err) ;
      }
      console.dir(files) 
      done();
    })
  });

});
