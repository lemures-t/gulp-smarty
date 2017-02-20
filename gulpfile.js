/*eslint-env node, node */
'use strict';
const gulp = require('gulp'),
  smarty = require('./index');

gulp.task('smarty-path', function() {
  return gulp.src('examples/tpls/*.htm?(l)')
    .pipe(smarty({
      path: './examples/data_src.json',
      // for smarty4js opts
      smarty_opt: {
        left_delimiter: '{',
        right_delimiter: '}'
      }
    }))
    .pipe(gulp.dest('./examples/dest/path'))
})

gulp.task('smarty-data', function() {
  return gulp.src('examples/tpls/*.htm?(l)')
    .pipe(smarty({
      data: {
        "ad3": {
          "src_data": {
            "data": {
              "data": {
                "chs": {
                  "edu_pic_ad3": {
                    "data": [{
                      "url": "https://v.qq.com/x/cover/2mjz2nvvlbgnsq8.html",
                      "img": "http://img1.gtimg.com/ninja/2/2017/01/ninja148481072940507.png",
                      "title": "校花说"
                    }]
                  }
                }
              }
            }
          }
        },
        "article": {
          "src_data": "http://page.ninja.webdev.com/index.php?g=HomeIndex&m=pacManage&a=seeOneData&id=416471",
          "res_wrapper": {
            "data": {
              "data": "{{RES}}"
            }
          },
          "req_opt": {
            "headers": {
              "Cookie": "PHPSESSID=lojtsh3s9u8k8stagpvdatj1p0"
            }
          }
        },
        "campus": {
          "src_data": "./examples/tpls_data/campus.json"
        },
        "focus": {
          "src_data": "http://page.ninja.webdev.com/index.php?g=HomeIndex&m=pacManage&a=seeOneData&id=416471",
          "res_wrapper": {
            "data": {
              "data": "{{RES}}"
            }
          },
          "req_opt": {
            "headers": {
              "Cookie": "PHPSESSID=lojtsh3s9u8k8stagpvdatj1p0"
            }
          }
        },
        "video": {
          "src_data": "./examples/tpls_data/video.json"
        },
        "wishes": {
          "src_data": "https://dev.cpcwe.com/wishes/wishes?app_name=wishes&festival_id=2"
        }
      },
      smarty_opt: {
        left_delimiter: '{',
        right_delimiter: '}'
      }
    }))
    .pipe(gulp.dest('./examples/dest/data'))
})
