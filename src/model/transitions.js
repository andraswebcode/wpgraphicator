import {
	Collection
} from 'backbone';

import Transition from './transition.js';

/**
 * Transitions collection.
 * @since 1.0.0
 * @class
 * @augments Backbone.Collection
 */

export default Collection.extend(/** @lends Transitions.prototype */{

	/**
	 * The model of this collection.
	 * @since 1.0.0
	 * @var {object}
	 */

	model:Transition,

	/**
	 * Comparator for sorting models by seconds.
	 * @since 1.0.0
	 * @var {string}
	 */

	comparator:'second'

});
