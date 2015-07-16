var expect = require('chai').expect
  , find = require('../../lib');

describe('fs-find:', function() {

  it('should callback with no files on no paths', function(done) {
    var base = 'test/fixtures/mock';
    find([], function(err, files) {
      if(err) {
        return done(err) ;
      }
      done();
    })
  });

  it('should callback with no files on no paths', function(done) {
    var base = 'test/fixtures/mock';
    find(function(err, files) {
      if(err) {
        return done(err) ;
      }
      done();
    })
  });

  it('should find files w/ string path', function(done) {
    var base = 'test/fixtures/mock';
    find(base, function(err, files) {
      if(err) {
        return done(err) ;
      }
      var map = find.map(files);
      expect(map[base + '/mock.txt']).to.be.an('object');
      expect(map[base + '/empty.txt']).to.be.an('object');
      expect(map[base + '/deep/alt.txt']).to.be.an('object');
      expect(map[base + '/deep/alt-file.txt']).to.be.an('object');
      done();
    })
  });

});
