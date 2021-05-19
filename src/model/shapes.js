import {
	Collection
} from 'backbone';

import Shape from './shape.js';

/**
 * Shapes collection.
 * @since 1.0.0
 * @class
 * @augments Backbone.Collection
 */

export default Collection.extend(/** @lends Shapes.prototype */{

	/**
	 * The model of this collection.
	 * @since 1.0.0
	 * @var {object}
	 */

	model:Shape,

	/**
	 * Comparator for sorting models by zIndex.
	 * @since 1.0.0
	 * @var {string}
	 */

	comparator:'zIndex',

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this._zIndex = 0;
		this.on('add', () => this._zIndex++);
	}

});
