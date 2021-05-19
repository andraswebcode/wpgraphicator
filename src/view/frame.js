import $ from 'jquery';
import {
	extend,
	pick
} from 'underscore';

import Base from './base.js';
import SubviewManager from './../utils/subview-manager.js';

/**
 * Frame view.
 * @since 1.0.0
 * @class
 * @abstract
 * @augments Base
 * @augments Backbone.View
 */

export default Base.extend(/** @lends Frame.prototype */{

	/**
	 * Preinitialize.
	 * @since 1.0.0
	 * @constructs
	 */

	preinitialize(options = {}){
		Base.prototype.preinitialize.call(this);
		extend(this, pick(options, this._viewOptions));
		if (this.name){
			this.el = $('#wpg-frame__' + this.name);
		}
		this.views = new SubviewManager(this.getViewOptions(), this.$.bind(this));
		this._bindBodyEvents();
	}

});
