'use strict';
const gutil 	= require('gulp-util'),
			through = require('through2'),
			smarty 	= require('smarty4js'),
			path 		= require('path'),
			fs 			= require('fs'),
			http 		= require('http'),
			https		= require('https'),
			url 		= require('url')

const PLUGIN_NAME = "gulp-smarty"

const read = (_path) => {
	try {
		return JSON.parse(fs.readFileSync(_path))
	}catch(err){
		throw new gutil.PluginError(PLUGIN_NAME,`Fail to read file ${_path}, error: ${err.code}`);
	}
}

/**
 * gulp flow design
 */
/*gulp.src('address_to_tpls_src')
	.pipe(smarty(
		{
			'data' : '../foo.json',
			'parent_obj' : {
				'data':{
					'data':'{{CHILD_OBJ}}'
				}
			},
			'req_opt' :{
				headers: {
					Cookie : 'ffdasf'
				}
			},
			'left_delimiter':  '{',
			'right_delimiter': '}'
		}
	))
	.dest('address_to_tpls_dist')*/


/**
 * sample src json file
 */
/*{
	// local json
	'name' : {
		'src_name' : ''
		'src_data' : {
			'key': value
		}
	},
	// json file
	'name' : {
		'src_name' : ''
		'src_data' : 'path to json',
	}
	// remote add
	'name' : {
		'src_name' : '' (optional)
		'src_data' : 'address',
		'req_opt' :{
			headers: {
				Cookie : 'ffdasf'
			}
		}
	}
}*/

const render = (opts) => {


	if (!opts || Object.prototype.toString.call(opts) !== '[object Object]') throw new gutil.PluginError(PLUGIN_NAME,'Arguments is Invalid');

	let DATA,p;
	// module.parent 是指触发这个 js 文件的 js 文件, 这里是某个gulpfile
	// module.id 是指 module.parent 的绝对路径
	// path.dirname(module.parent.id), 是找到 gulpfile 的父级目录
	let root = path.dirname(module.parent.id)

	if (opts.path){
		p = path.isAbsolute(opts.path) ? opts.path : path.join(root,opts.path); // p 存储 json 文件的绝对路径
		DATA = read(p);
	}else if (opts.data){
		if (Object.prototype.toString.call(opts.data) !== '[object Object]'){
			throw new gutil.PluginError(PLUGIN_NAME,"The Value of 'data' in Arguments Object is Expected to be JSON Data as Object");
		}
		DATA = opts.data;
	}else{
		throw new gutil.PluginError(PLUGIN_NAME,"The key 'data' or 'path' in Arguments Object is Expected");
	}

	// file from gulp is vinyl file, is not normal stream
	// so through.obj should be used
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}
		if (file.isStream()) {
			cb(new gutil.PluginError(PLUGIN_NAME, 'Stream not supported'));
			return;
		}

		if (file.isBuffer()){
		  let key = path.basename( file.path, path.extname(file.path) );
			let src = DATA [key];
			let that = this;
			let result;

			let SMARTY = new smarty();

			SMARTY.config({
				'left_delimiter':  '{',
				'right_delimiter': '}'
			})
			// origign json data;
			if (typeof src === 'object'){
				try{
					result = SMARTY.render(file.path,src);
					file.contents = new Buffer(result);
				}catch(e){
					return cb(new gutil.PluginError(PLUGIN_NAME,e))
				}
				return cb(null,file)
			}

			if (typeof src === 'string'){

			  // remote data
			  let matched = src.match(/^http(s)?\:\/\//);

			  if (matched){
					let u = url.parse(src);
					let protocol = matched[1] ? https : http;

		      protocol.get({
		        hostname : u.hostname,
		        path : u.path,
		        headers: {
		          Cookie: "PHPSESSID=lojtsh3s9u8k8stagpvdatj1p0"
		        }
		      },function(res){
		        let raw = '';
						if (res.statusCode != '200') {
							return cb(new gutil.PluginError(PLUGIN_NAME,`GET ${src} return ${res.statusCode}`))
						}
	          res.on('data',function(data){
	            raw += data.toString();
	          })
	          res.on('end',function(){
	            let _d = JSON.parse(raw);
	            _d = {
	              "data":{
	                "data":_d
	              }
	            }
							try{
								result = SMARTY.render(file.path,_d);
								file.contents = new Buffer(result);
							}catch(e){
								return cb(new gutil.PluginError(PLUGIN_NAME,e))
							}

							return cb(null,file)
	          })
		      })
			  // file data
			  }else{
					let _p = path.isAbsolute(src) ? src : path.join(path.dirname(p),src)
					let _d = read(_p);
					try{
						result = SMARTY.render(file.path,_d);
						file.contents = new Buffer(result);
					}catch(e){
						return cb(new gutil.PluginError(PLUGIN_NAME,e))
					}
					return cb(null,file)
			  }
			}
		}
	});
};


module.exports = render;
