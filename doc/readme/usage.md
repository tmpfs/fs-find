## Usage

```javascript
find(path, [opts], cb)
```

```javascript
var find = require('fs-find')
  , path = process.cwd();
find(path, function(err, results) {
  if(err) {
    return console.error(err);
  }
  console.dir(results);
}
```

### Options

* `filter`: Generic filter function before `stat` is called.
* `file`: Filter function for files.
* `folder`: Filter function for directories.
* `fullpath`: Use full file path for matching.
* `followLinks`: Follow symbolic links (`stat` rather than `lstat`).

### Filter

Filter functions have the signature `function filter(path, info)` and should 
return a `boolean`. The `info` object may be modified in place and will be 
included in the results array.

### Info

The `info` object contains the fields:

* `file`: The full file path.
* `name`: The basename of the file.
* `folder`: The parent folder.
* `matcher`: Either the file path or name depending upon the `fullpath` option.
* `stat`: An `fs.Stats` object when available.

### Events

* `entry`: Emitted when a `stat` is available.
* `unsupported`: Emitted when a file is not a file, folder or symbolic link.
