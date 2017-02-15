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

const read = (p) => {
	let _path;
	if (path.isAbsolute(p)){
		_path = p
	}else{
		// __dirname is expected to be */gulp-smarty, only in dev env
		if (path.basename(path.resolve(__dirname,'../')) !== 'node_modules'){
			_path = path.join(__dirname,p)
		// __dirname is expected to be */project-name/node_modules/gulp-smarty
		// resolve to project-name
		}else{
			_path = path.join(path.resolve(__dirname,'../','../'),p);
		}
	}

	try {
		return JSON.parse(fs.readFileSync(_path))
	}catch(err){
		throw new gutil.PluginError(PLUGIN_NAME,`Fail to read file ${p}, error: ${err.code}`);
	}
}

/**
 * gulp flow design
 */
/*gulp.src('address_to_tpls_src')
	.pipe(smarty(
		{
			'src' : '../foo.json',
			'parent_obj' : {
				'data':{
					'data':'{{CHILD_OBJ}}'
				}
			},
			'req_opt' :{
				headers: {
					Cookie : 'ffdasf'
				}
			}
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

	if (typeof opts.data === 'undefined') throw new gutil.PluginError(PLUGIN_NAME,"No Key 'data' in Arguments Object");

	let data;

	switch (typeof opts.data){
		case 'string':
			data = read(opts.data);
			//console.log(require(data));
			break;
		case 'object':
			data = opts.data;
			break;
		default:
			throw new gutil.PluginError(PLUGIN_NAME,"The Value of 'data' in Arguments Object is Expected to be Path as String or JSON Data as Object");
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
			let src = data [key];

			// origign json data;
			if (typeof src === 'object'){
				//console.log('json',src)
			}
			if (typeof src === 'string'){

				// remote data
				let matched = src.match(/^http(s)?\:\/\//)
				if (matched){
					// https protocal
					if (matched[1]){
						//console.log('remote https',src)

					// http protocal
					}else{
						let u = url.parse(src);
						http.get({
							hostname : u.hostname,
							path : u.path,
							headers: {
								Cookie: "PHPSESSID=lojtsh3s9u8k8stagpvdatj1p0"
							}
						},function(res){
							console.log('code', res.statusCode)

							let raw = '';

							if (res.statusCode == '200'){
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

									let s = new smarty();
									s.config({
										'left_delimiter':  '{',
    								'right_delimiter': '}'
									})
									console.log(_d)
									console.log(file.path)
									let a  = s.render(file.path,_d);
									console.log('result',a);


								})
							}

						})
						//console.log('remote http',src)
					}


				// file data
				}else{
					//console.log('file',src)
				}
			}






			//cb( new gutil.PluginError(PLUGIN_NAME, 'Buffer not supported'))
		}



		/*try {
			//console.log(file)
			//file.contents = new Buffer();
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
		}*/

		cb();
	});
};


module.exports = render;
