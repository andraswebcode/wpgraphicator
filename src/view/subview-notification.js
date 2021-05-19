import {
	isFunction
} from 'underscore';

import Subview from './subview.js';

/**
 * Settings notification.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends Notification.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'notification',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-notification-confirm-button':'_confirmNotification',
		'click .wpg-notification-dismiss-button':'_dismissNotification',
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		const type = this.model.get('type');
		this.$el.addClass(`wpg-notification-${type}`);
	},

	/**
	 * Focus on confirm button after render
	 * so that you can use enter key to confirm.
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		setTimeout(() => this.$('.wpg-notification-confirm-button').trigger('focus'), 20);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_confirmNotification(e){
		e.preventDefault();
		const confirm = this.model.get('confirm');
		if (isFunction(confirm)){
			confirm();
		}
		this.notifications.remove(this.model);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_dismissNotification(e){
		e.preventDefault();
		const dismiss = this.model.get('dismiss');
		if (isFunction(dismiss)){
			dismiss();
		}
		this.notifications.remove(this.model);
	}

});
