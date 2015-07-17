var fs  = require('fs')
  , path = require('path')
  , util = require('util')
  , assert = require('assert')
  , events = require('events');

/**
 *  Generic accept function.
 */
function accept(path, info) {
  return true;
}

/**
 *  Generic reject function.
 */
function reject(path, info) {
  return false;
}

/**
 *  Walk target files and directories.
 */
function Walker(paths, opts, cb) {
  assert(
    Array.isArray(paths) || typeof paths === 'string',
    'walk expects file or folder path(s)');

  if(!Array.isArray(paths)) {
    paths = [paths];
  }

  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  }

  opts = opts || {};

  var files = paths
    , scope = this
    , i = 0
    , list = [];

  opts.filter = typeof opts.filter === 'function'
    ? opts.filter : accept;
  opts.file = typeof opts.file === 'function'
    ? opts.file : accept;
  opts.folder = typeof opts.folder === 'function'
    ? opts.folder : accept;

  function getInfo(file) {
    var nm = path.basename(file)
      , matcher = opts.fullpath ? file : nm;
    var info = {
      file: file,
      name: nm,
      folder: path.dirname(file),
      matcher: matcher,
      stat: null,
    };
    return info;
  }

  var depth = 0;
  // walk the file list array
  function walk(files, cb, list) {
    var i = 0;
    list = list || [];

    //console.log( 'walk %j', files)

    function check(file, cb) {
      var info = getInfo(file);

      if(!opts.filter(file, info)) {
        return cb(null, list); 
      }

      // stat on target file being read
      var method = opts.followLinks ? fs.stat : fs.lstat;
      method.call(fs, file, function onStat(err, stats) {
        if(err) {
          return cb(err);
        }

        info.stat = stats;
        scope.emit('entry', file, info);

        if(stats.isFile() || stats.isSymbolicLink()) {
          scope.emit(stats.isFile() ? 'file' : 'link', file, info);
          if(opts.file(file, info)) {
            list.push(info);
          }
          return cb(null, list);
        }else if(stats.isDirectory()) {
          scope.emit('folder', file, info);

          // do not descend into directory
          if(!opts.folder(file, info)) {
            //console.warn('ignored by folder function %s', file);
            return cb(null, list); 
          }else if(opts.dirs) {
            list.push(info);
          }

          return fs.readdir(file, function onRead(err, children) {
            /* istanbul ignore next: difficult error to mock */
            if(err) {
              return cb(err);
            }

            ++depth;
            //console.log('enter dir %s with depth %s (%s)', file, depth, opts.depth)

            // no children in list
            if(!children.length) {
              return cb(null, list);
            }

            // make paths absolute for children
            children = children.map(function(nm) {
              return path.join(file, nm);
            })

            if(opts.depth && depth && depth > opts.depth) {
              //console.warn('skipping entry on depth %s (%s)', depth, file)
              --depth;
              return cb(null, list);
            }

            return walk(children, function() {
              --depth;
              //console.log('walk complete %s', file)
              cb.apply(null, arguments);
            }, list);
          })
        }else{
          scope.emit('unsupported', file, info, list);
          return cb(null, list);
        }
      });
    }

    if(!files[i]) {
      return cb(null, list); 
    }

    check(files[i], function onCheck(err, list) {
      if(err) {
        return cb(err);
      }
      if(i === files.length - 1) {
        return cb(null, list);
      }
      i++;
      check(files[i], onCheck);
    });
  }

  walk(files, function onList(err, list) {
    if(err) {
      return cb(err);
    }
    cb(null, list);
  });
}

util.inherits(Walker, events.EventEmitter);

function map(list) {
  var o = {};
  list.forEach(function(info, index, arr) {
    o[info.file] = info; 
  })
  return o;
}

function run(paths, opts,cb) {
  return new Walker(paths, opts, cb);
}

run.Walk = Walker;
run.accept = accept;
run.reject = reject;
run.map = map;

module.exports = run;
