import {
	Collection
} from 'backbone';

import Notification from './notification.js';
import {
	NOTIFICATION_LIFETIME
} from './../utils/constants.js';

/**
 * Notifications collection.
 * @since 1.0.0
 * @class
 * @augments Backbone.Collection
 */

export default Collection.extend(/** @lends Notifications.prototype */{

	/**
	 * The model of this collection.
	 * @since 1.0.0
	 * @var {object}
	 */

	model:Notification,

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.on('add', this._removeNotice);
	},

	/**
	 * Remove notification in some seconds after it is added.
	 * @since 1.0.0
	 * @access private
	 * @param {object} notice A new notification model instance.
	 */

	_removeNotice(notice){
		if (!notice.get('confirm') && !notice.get('dismiss')){
			setTimeout(() => this.remove(notice), NOTIFICATION_LIFETIME);
		}
	}

});
