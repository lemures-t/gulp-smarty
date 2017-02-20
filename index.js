'use strict';
const gutil = require('gulp-util'),
  through = require('through2'),
  smarty = require('smarty4js'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  url = require('url')

const PLUGIN_NAME = "gulp-smarty"

const read = (_path) => {
  try {
    return JSON.parse(fs.readFileSync(_path))
  } catch (err) {
    throw new gutil.PluginError(PLUGIN_NAME, `Fail to read file ${_path}, error: ${err}`);
  }
}

const render = (opts) => {

  if (!opts || Object.prototype.toString.call(opts) !== '[object Object]') throw new gutil.PluginError(PLUGIN_NAME, 'Arguments is Invalid');

  let DATA, p;
  // module.parent 是指触发这个 js 文件的 js 文件, 这里是某个gulpfile
  // module.id 是指 module.parent 的绝对路径
  // path.dirname(module.parent.id), 是找到 gulpfile 的父级目录
  let root = path.dirname(module.parent.id)

  if (opts.path) {
    if (Object.prototype.toString.call(opts.path) !== '[object String]') {
      throw new gutil.PluginError(PLUGIN_NAME, "The Value of 'path' in Arguments Object is Expected to be path as String");
    }
    // p 存储 json 文件的绝对路径
    p = path.isAbsolute(opts.path) ? opts.path : path.join(root, opts.path);
    DATA = read(p);
  } else if (opts.data) {
    if (Object.prototype.toString.call(opts.data) !== '[object Object]') {
      throw new gutil.PluginError(PLUGIN_NAME, "The Value of 'data' in Arguments Object is Expected to be JSON Data as Object");
    }
    DATA = opts.data;
  } else {
    throw new gutil.PluginError(PLUGIN_NAME, "The key 'data' or 'path' in Arguments Object is Expected");
  }


  if (opts.smarty_opt && Object.prototype.toString.call(opts.smarty_opt) !== '[object Object]') {
    throw new gutil.PluginError(PLUGIN_NAME, "The Value of 'opts.smarty_opt' in Arguments Object is Expected to be JSON Data as Object");
  }
  // file from gulp is vinyl file, is not normal stream
  // so through.obj should be used
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    if (file.isStream()) {
      cb(new gutil.PluginError(PLUGIN_NAME, 'Stream not supported'));
      return;
    }

    if (file.isBuffer()) {
      let key = path.basename(file.path, path.extname(file.path));
      let config = DATA[key]
      let src = config.src_data;
      let that = this;
      let result;

      let SMARTY = new smarty();

      opts.smarty_opt && SMARTY.config(opts.smarty_opt)

      // origign json data;
      if (typeof src === 'object') {
        try {
          result = SMARTY.render(file.path, src);
          file.contents = new Buffer(result);
        } catch (e) {
          return cb(new gutil.PluginError(PLUGIN_NAME, e))
        }
        return cb(null, file)
      }

      if (typeof src === 'string') {

        // remote data
        let matched = src.match(/^http(s)?\:\/\//);

        if (matched) {
          let u = url.parse(src);
          let protocol = matched[1] ? https : http;

          let remote_config = {
            hostname: u.hostname,
            path: u.path
          }

          if (config.req_opt) {
            remote_config = Object.assign(remote_config, config.req_opt)
          }
          protocol.get(remote_config, function(res) {
              let raw = '';
              if (res.statusCode != '200') {
                return cb(new gutil.PluginError(PLUGIN_NAME, `GET ${src} return ${res.statusCode}`))
              }
              res.on('data', function(data) {
                raw += data.toString();
              })
              res.on('end', function() {
                if (config.res_wrapper) {
                  raw = JSON.stringify(config.res_wrapper).replace(/"{{RES}}"/, raw);
                }
                let _d = JSON.parse(raw);
                try {
                  result = SMARTY.render(file.path, _d);
                  file.contents = new Buffer(result);
                } catch (e) {
                  return cb(new gutil.PluginError(PLUGIN_NAME, e))
                }

                return cb(null, file)
              })
            })
            // file data
        } else {
          let _p;
          if (path.isAbsolute(src)) {
            _p = src;
          } else {
            _p = !p ? path.join(root, src) : path.join(path.dirname(p), src)
          }

          let _d = read(_p);
          try {
            result = SMARTY.render(file.path, _d);
            file.contents = new Buffer(result);
          } catch (e) {
            return cb(new gutil.PluginError(PLUGIN_NAME, e))
          }
          return cb(null, file)
        }
      }
    }
  });
};


module.exports = render;
