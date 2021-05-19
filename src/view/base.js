import $ from 'jquery';
import {
	View
} from 'backbone';
import {
	result,
	isFunction,
	each,
	mapObject,
	extend
} from 'underscore';

/**
 * Base view.
 * @since 1.0.0
 * @class
 * @abstract
 * @augments Backbone.View
 */

export default View.extend(/** @lends Base.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @access protected
	 * @var {string}
	 */

	name:'',

	/**
	 *
	 * @since 1.0.0
	 * @var {object}
	 */

	bodyEvents:{},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @var {array}
	 */

	_viewOptions:['state', 'project', 'shapes', 'scene', 'anime', 'clipboard', 'notifications', 'history'],

	/**
	 * Preinitialize.
	 * @since 1.0.0
	 * @constructs
	 */

	preinitialize(){
		this.$window = $(window);
		this.$document = $(document);
		this.$body = $('body');
	},

	/**
	 * Get editor state.
	 * @since 1.0.0
	 * @param {string} attr
	 * @return {mixed}
	 */

	getState(attr){
		if (!this.state){
			return;
		}
		return this.state.get(attr);
	},

	/**
	 * Set editor state.
	 * @since 1.0.0
	 * @param {string} key
	 * @param {mixed} value
	 * @param {object} options
	 * @return {object}
	 */

	setState(key, value, options) {
		if (!this.state){
			return this;
		}
		this.state.set(key, value, options);
		return this;
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	getViewOptions(){
		const options = {};
		each(this._viewOptions, opt => {
			options[opt] = this[opt];
		}, this);
		return options;
	},

	/**
	 * Get css width of a view or an element of a view.
	 * @since 1.0.0
	 * @return {int|float}
	 */

	getWidth(selector){
		return selector ? this.$(selector).width() : this.$el.width();
	},

	/**
	 * Get css height of a view or an element of a view.
	 * @since 1.0.0
	 * @return {int|float}
	 */

	getHeight(selector){
		return selector ? this.$(selector).height() : this.$el.height();
	},

	/**
	 * With this method we can easy send any type of notification
	 * that appears at the bottom left side of the editor.
	 * @since 1.0.0
	 * @param {string} message
	 * @param {string} type 'default', 'success', 'warning', 'error'
	 * @param {function|boolean} confirm
	 * @param {function|boolean} dismiss
	 */

	sendNotice(message = '', type, confirm, dismiss){
		this.notifications.add({
			message,
			type,
			confirm,
			dismiss
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access protected
	 */

	_bindBodyEvents(){
		const events = result(this, 'bodyEvents');
		const bodyEvents = mapObject(events, fn => {
			if (isFunction(this[fn])){
				return this[fn].bind(this);
			}
		});
		this.$body.on(bodyEvents);
	}

});
