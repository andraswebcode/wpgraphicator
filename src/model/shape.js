import {
	Model
} from 'backbone';
import {
	extend,
	min,
	max,
	isObject,
	throttle
} from 'underscore';

import Properties from './properties.js';

/**
 * Shape model.
 * @since 1.0.0
 * @class
 * @augments Backbone.Model
 */

export default Model.extend(/** @lends Shape.prototype */{

	/**
	 * Model defaults.
	 * @since 1.0.0
	 * @var {object}
	 */

	defaults:{
		id:'',
		type:'',
		name:'',
		start:0,
		duration:0,
		zIndex:0,
		properties:[]
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this._properties = new Properties(this.get('properties'));
		this.on('change:properties', (model, properties) => this._properties.set(properties));
		this.set('zIndex', this.collection._zIndex, {
			silent:true
		});
		setTimeout(() => {
			this._setStartDuration();
			// Save initial state of this model.
			// @see History.prototype.__addToStack()
			this._prevState = this.toJSON();
		}, 10);
		this.listenTo(this._properties, 'add remove', model => {
			setTimeout(this._setStartDuration.bind(this), 2);
			this.listenTo(model._transitions, 'add change:second remove', throttle(this._setStartDuration.bind(this), 40));
		});
		// Trigger 'wpg:pushtohistorystack' for history manager.
		this.listenTo(this._properties, 'add change remove', () => this.trigger('wpg:pushtohistorystack', this, 'change'));
		this.listenTo(this._properties, 'wpg:pushtohistorystack', () => this.trigger('wpg:pushtohistorystack', this, 'change'));
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	toJSON(){
		return extend(
			Model.prototype.toJSON.call(this), {
				properties:this._properties.toJSON()
			}
		);
	},

	/**
	 * Create keyframes for anime timeline.
	 * @since 1.0.0
	 */

	toAnime(){
		return this._properties.toAnime();
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {boolean}
	 */

	moveForward(){
		const thisZIndex = this.get('zIndex');
		const nextModel = this.collection.findWhere(model => model.get('zIndex') > thisZIndex);
		if (!nextModel){
			return false;
		}
		this.set('zIndex', nextModel.get('zIndex'));
		nextModel.set('zIndex', thisZIndex);
		this.collection.sort();
		return true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {boolean}
	 */

	moveBackward(){
		const thisZIndex = this.get('zIndex');
		const prevModel = max(this.collection.where(model => model.get('zIndex') < thisZIndex), model => model.get('zIndex'));
		if (!prevModel || !prevModel.cid){ // Sometimes it returns -Infinity so we have to check its cid to make sure that it is a model.
			return false;
		}
		this.set('zIndex', prevModel.get('zIndex'));
		prevModel.set('zIndex', thisZIndex);
		this.collection.sort();
		return true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_setStartDuration(){
		const json = this._properties.toJSON();
		const startModel = min(json.map(model => min(model.transitions, 'second')), 'second');
		const endModel = max(json.map(model => max(model.transitions, 'second')), 'second');
		const start = isObject(startModel) ? startModel.second : 0;
		const end = isObject(endModel) ? endModel.second : start;
		this.set({
			start,
			duration:end - start
		});
	}

});
