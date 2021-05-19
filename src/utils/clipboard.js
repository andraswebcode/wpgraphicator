import {
	noop
} from 'underscore';

/**
 * Clipboard.
 * @since 1.0.0
 * @class
 */

export default class {

	/**
	 * Register object to copy.
	 * @since 1.0.0
	 * @param {object} object Object to copy.
	 * @param {string} type
	 */

	copy(object = {}, type){
		this._object = object;
		this._type = type;
	}

	/**
	 * Calling fn function only if type is the same as registered type.
	 * @since 1.0.0
	 * @param {function} fn
	 * @param {string} type
	 */

	paste(fn = noop, type){
		if (this._object && type === this._type){
			return fn(this._object);
		}
	}

}
