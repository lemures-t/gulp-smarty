'use strict';

const {
  assert,
  expect,
  should
} = require('chai');
const smarty = require('../');
const gutil = require('gulp-util');
const path = require('path');
const vinyl = require('vinyl')
const fs = require('fs');

const createVinyl = (TPL, contents) => {
  let base = path.join(__dirname, 'tpl');
  let filePath = path.join(base, TPL);

  return new gutil.File({
    cwd: __dirname,
    base: base,
    path: filePath,
    contents: contents || fs.readFileSync(filePath)
  });
}

describe('gulp-smarty-constructor', function() {

  it('argument is not an object', function(done) {
    assert.throws(function() {
      let stream = smarty('arguments')
    }, gutil.PluginError, /Arguments is Invalid/, 'empty arguments')
    done();
  });

  it('argument is an invalid object', function(done) {
    assert.throws(function() {
      let stream = smarty({})
    }, gutil.PluginError, /The key 'data' or 'path' in Arguments Object is Expected/, 'no data or path key')
    done();
  });

  it('argument object key "data" is not an object', function(done) {
    assert.throws(function() {
      let stream = smarty({
        'data': 'data'
      })
    }, gutil.PluginError, /JSON Data as Object/, 'invalid value of arguments key data')
    done();
  });

  it('argument object key "path" is not a string', function(done) {
    assert.throws(function() {
      let stream = smarty({
        'path': []
      })
    }, gutil.PluginError, /path as String/, 'invalid value of arguments key path')
    done();
  });

  it('fail to read file content from "path" value', function(done) {
    assert.throws(function() {
      let stream = smarty({
        'path': './foo.json'
      })
    }, /Fail to read file/, 'no such file or directory')
    done();
  })

  it('fail to parse file content from "path" value', function(done) {
    assert.throws(function() {
      let stream = smarty({
        'path': './err_data_src.json'
      })
    }, /Fail to read file (.*) JSON/, 'no such file or directory')
    done();
  })

});


describe('gulp-smarty-render', function() {

  it('should pass file when it isNull()', function(done) {
    let stream = smarty({
      'data': {}
    });
    let emptyFile = {
      isNull: function() {
        return true;
      }
    };
    stream.once('data', function(data) {
      assert.equal(data, emptyFile, 'emptyFile pass')
      done();
    });
    stream.write(emptyFile);
    stream.end();
  });

  it('cannot handle file when it isStream()', function(done) {
    let stream = smarty({
      'data': {}
    });
    let streamFile = {
      isNull: function() {
        return false;
      },
      isStream: function() {
        return true;
      }
    };
    stream.once('error', function(error) {
      assert.equal(error.message, 'Stream not supported')
      done();
    })
    stream.write(streamFile);
    stream.end()
  })

  it('render argument with key data', function(done) {
    let stream = smarty({
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
        "campus": {
          "src_data": "./data/campus.json"
        },
        "wishes": {
          "src_data": "https://dev.cpcwe.com/wishes/wishes?app_name=wishes&festival_id=2&wishes_id=105",
          "res_wrapper": {
            "data": "{{RES}}"
          }
        }
      },
      smarty_opt: {
        left_delimiter: '{',
        right_delimiter: '}'
      }
    });
    let tpls = [
      createVinyl('ad3.html'),
      createVinyl('campus.html'),
      createVinyl('wishes.html')
    ];
    let count = tpls.length;
    //whole file as Buffer
    stream.on('data', function(renderedFile) {
      assert.isOk(vinyl.isVinyl(renderedFile), 'tpl is wrappered as vinyl file');
      assert.isOk(renderedFile.contents, 'tpl has content');
      assert.equal(renderedFile.contents.toString(), fs.readFileSync(path.join(__dirname, 'result', renderedFile.relative), 'utf-8'), 'render correct');
      if (!--count) done();
    });
    for (let j = 0; j < tpls.length; j++) {
      stream.write(tpls[j]);
    }
    stream.end()
  });

  it('render argument with key path', function(done) {
    let stream = smarty({
      path: './data_src.json',
      smarty_opt: {
        left_delimiter: '{',
        right_delimiter: '}'
      }
    })
    let tpls = [
      createVinyl('ad3.html'),
      createVinyl('campus.html'),
      createVinyl('wishes.html')
    ];
    let count = tpls.length;
    //whole file as Buffer
    stream.on('data', function(renderedFile) {
      assert.isOk(vinyl.isVinyl(renderedFile), 'tpl is wrappered as vinyl file');
      assert.isOk(renderedFile.contents, 'tpl has content');
      assert.equal(renderedFile.contents.toString(), fs.readFileSync(path.join(__dirname, 'result', renderedFile.relative), 'utf-8'), 'render correct');
      if (!--count) done();
    });
    for (let j = 0; j < tpls.length; j++) {
      stream.write(tpls[j]);
    }
    stream.end()
  });

  it('remote address error', function(done) {
    let stream = smarty({
      data: {
        "article": {
          "src_data": "http://page.ninja.webdev.com/index.php?g=HomeIndex&m=pacManage&a=seeOneData&id=416471"
        }
      },
      smarty_opt: {
        left_delimiter: '{',
        right_delimiter: '}'
      }
    })
    let tpl = createVinyl('article.html');

    stream.once('error', function(error) {
      assert.match(error.message, /GET http:\/\/page\.ninja\.webdev\.com\/index\.php\?g\=HomeIndex\&m\=pacManage\&a\=seeOneData&id=416471/, 'remote reponse error')
      done();
    })

    stream.write(tpl);

    stream.end()
  })

})
