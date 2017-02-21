# gulp-smarty [![Build Status](https://travis-ci.org/lemures-t/gulp-smarty.svg?branch=master)](https://travis-ci.org/lemures-t/gulp-smarty)

> My groundbreaking gulp plugin


## Install

```
$ npm install --save-dev gulp-smarty
```


## Usage

```js
const gulp = require('gulp');
const smarty = require('gulp-smarty');

gulp.task('default', () => {
	gulp.src('src/file.ext')
		.pipe(smarty())
		.pipe(gulp.dest('dist'))
);
```


## API

### smarty([options])

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## License

MIT © [](http://www.qq.com)
