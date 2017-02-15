/*eslint-env node, node */
'use strict';
const gulp = require('gulp'),
      smarty = require('./index');


gulp.task('smarty',function(){
  return gulp.src('test/tpls/*.htm?(l)')
    .pipe(smarty({
      data:'test/data_src.json'
    }))
    .pipe(gulp.dest('./test/dest'))
})
