import {
	Model
} from 'backbone';

/**
 * Transition model.
 * @since 1.0.0
 * @class
 * @augments Backbone.Model
 */

export default Model.extend(/** @lends Transition.prototype */{

	/**
	 * Model defaults.
	 * @since 1.0.0
	 * @var {object}
	 */

	defaults:{
		shapeId:'',
		property:'',
		second:0,
		value:'',
		easing:'linear'
	}

});
