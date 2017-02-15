'use strict';
let gutil = require('gulp-util');
let through = require('through2');
let smarty = require('smarty4js');

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-smarty', 'Streaming not supported'));
			return;
		}

		try {
			file.contents = new Buffer(someModule(file.contents.toString(), opts));
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-smarty', err));
		}

		cb();
	});
};
