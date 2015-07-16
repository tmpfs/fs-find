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

  // walk the file list array
  function walk(files, cb, list) {
    var i = 0;
    list = list || [];

    function check(file, cb) {
      var info = getInfo(file);

      if(!opts.filter(file, info)) {
        //console.warn('ignored by filter function %s', file);
        return cb(null, list); 
      }

      // stat on target file being read
      var method = opts.followLinks ? fs.stat : fs.lstat;
      method.call(fs, file, function onStat(err, stats) {
        if(err) {
          return cb(err);
        }

        info.stat = stats;

        if(stats.isFile() || stats.isSymbolicLink()) {
          if(opts.file(file, info)) {
            list.push(info);
          }else{
            //console.warn('ignored by file function %s', file);
          }
          return cb(null, list);
        }else if(stats.isDirectory()) {

          if(!opts.folder(file, info)) {
            //console.warn('ignored by folder function %s', file);
            return cb(null, list); 
          }

          return fs.readdir(file, function onRead(err, children) {
            if(err) {
              return cb(err);
            }

            // no children in list
            if(!children.length) {
              return cb(null, list);
            }

            // make paths absolute for children
            children = children.map(function(nm) {
              return path.join(file, nm);
            })

            return walk(children, cb, list);
          })
        }else{
          scope.emit('unsupported', file, info);
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
run.map = map;

module.exports = run;
