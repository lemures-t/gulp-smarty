/*eslint-env node, node */
'use strict';
const gulp = require('gulp'),
      smarty = require('./index');


gulp.task('smarty',function(){
  return gulp.src('test/tpls/*.htm?(l)')
    .pipe(smarty({
      path:'test/data_src.json',
      data:''
    }))
    .pipe(gulp.dest('./test/dest'))
})
