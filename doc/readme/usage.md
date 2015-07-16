## Usage

```javascript
var find = require('fs-find')
  , path = process.cwd();
find(path, function(err, files) {
  if(err) {
    return console.error(err);
  }
  console.dir(files);
}
```
