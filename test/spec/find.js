var expect = require('chai').expect
  , find = require('../../lib')
  , base = 'test/fixtures/mock';

function reject(path, info) {
  return false;
}

describe('fs-find:', function() {

  it('should callback with no files on no paths', function(done) {
    find([], function(err, files) {
      if(err) {
        return done(err) ;
      }
      done();
    })
  });

  it('should find files w/ string path', function(done) {
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

  it('should find files and directories (dirs: true)', function(done) {
    find(base, {dirs: true}, function(err, files) {
      if(err) {
        return done(err) ;
      }
      var map = find.map(files);
      expect(map[base + '/deep']).to.be.an('object');
      done();
    })
  });

  it('should find directories upto max depth (depth: 1)', function(done) {
    find(base, {dirs: true, depth: 1, file: find.reject}, function(err, files) {
      if(err) {
        return done(err) ;
      }
      var map = find.map(files);
      // includes target dir in result
      expect(map[base]).to.be.an('object');
      expect(map[base + '/deep']).to.be.an('object');
      done();
    })
  });

  it('should find nothing with filter function', function(done) {
    find(base, {filter: reject}, function(err, files) {
      if(err) {
        return done(err) ;
      }
      expect(files.length).to.eql(0);
      done();
    })
  });

  it('should find nothing with file function', function(done) {
    find(base, {file: reject}, function(err, files) {
      if(err) {
        return done(err) ;
      }
      expect(files.length).to.eql(0);
      done();
    })
  });

  it('should find nothing with folder function', function(done) {
    find(base, {folder: reject}, function(err, files) {
      if(err) {
        return done(err) ;
      }
      expect(files.length).to.eql(0);
      done();
    })
  });

  it('should find nothing with empty folder', function(done) {
    find('test/fixtures/empty', function(err, files) {
      if(err) {
        return done(err) ;
      }
      expect(files.length).to.eql(0);
      done();
    })
  });

  it('should find files w/ followLinks', function(done) {
    find([base], {followLinks: true}, function(err, files) {
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

  it('should find files w/ fullpath option', function(done) {
    find([base], {fullpath: true}, function(err, files) {
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

  // events
  it('should emit unsupported event on character device', function(done) {
    var finder = find(['/dev/null'], function(err, files) {
      if(err) {
        return done(err) ;
      }
      done();
    })

    finder.on('unsupported', function(file, info) {
      //console.dir(arguments) 
      //console.dir(files)
      expect(info.stat).to.be.an('object');
      expect(info.stat.isCharacterDevice()).to.eql(true);
    })
  });

});
