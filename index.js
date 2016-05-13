'use strict';
const parents = require('parents');
const slash = require('slash');
const pify = require('pify');

function mkdirp(dir) {
	if (typeof dir !== 'string') {
		return Promise.reject(new Error('`path` is required'));
	}

	const dirs = parents(dir);

	// skip root as it's always there
	if (dirs[dirs.length - 1] === '/') {
		dirs.pop();
	}

	if (dirs.length === 0) {
		return Promise.resolve();
	}

	const mkdir = dir => {
		dir = slash(dir);

		return pify(this.raw.mkd.bind(this.raw))(dir)
			.then(() => dirs.length > 0 && mkdir(dirs.pop()))
			.catch(err => {
				if (err.code === 550 && dirs.length > 0) {
					return mkdir(dirs.pop());
				}

				err.message += ` - mkd: ${dir}`;
				throw err;
			});
	};

	return mkdir(dirs.pop());
}

module.exports = JSFtp => {
	JSFtp.prototype = Object.create(JSFtp.prototype, {
		mkdirp: {
			value: mkdirp
		}
	});
};
