var expect = require('chai').expect
  , find = require('../../lib');

describe('fs-find:', function() {

  it('should find files', function(done) {
    var base = 'test/fixtures/mock';
    find([base], function(err, files) {
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
