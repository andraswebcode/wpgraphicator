import {
	Model
} from 'backbone';

/**
 * Notification model.
 * @since 1.0.0
 * @class
 * @augments Backbone.Model
 */

export default Model.extend(/** @lends Notification.prototype */{

	/**
	 * Model defaults.
	 * @since 1.0.0
	 * @var {object}
	 */

	defaults:{
		message:'',
		type:'default',
		confirm:null,
		dismiss:null
	}

});
