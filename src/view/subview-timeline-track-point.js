import $ from 'jquery';
import {
	i18n
} from 'wordpress';
import {
	util
} from 'fabric';
import {
	contains,
	throttle,
	debounce,
	each,
	uniq
} from 'underscore';
import {
	createPopperLite,
	preventOverflow,
	flip
} from '@popperjs/core';

import Subview from './subview.js';
import {
	notificationMessages,
	replaceCollidedParams,
	propertyNames,
	easings,
	animatables,
	parsePoints,
	clamp,
	toFixed,
	serializeGradient,
	parseGradient
} from './../utils/utils.js';
import {
	FRACTION_DIGITS,
	COLOR_PICKER_WIDTH
} from './../utils/constants.js';

const {
	__,
	sprintf
} = i18n;

const {
	parsePath
} = util;

const {
	removePoint
} = notificationMessages;

/**
 * Timeline track point subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends TimelineTrackPoint.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline-track-point',

	/**
	 * Html attributes of the view.
	 * @since 1.0.0
	 * @var {object}
	 */

	attributes(){
		return {
			'data-cid':this.cid
		};
	},

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'dblclick .wpg-timeline-track-point-diamond':'_openPopup',
		'mousedown .wpg-timeline-track-point-diamond':'_focusDiamond',
		'mouseup .wpg-timeline-track-point-diamond':'_sortCollection',
		'touchstart .wpg-timeline-track-point-diamond':'_onTouchStartDiamond',
		'touchmove .wpg-timeline-track-point-diamond':'_onTouchMoveDiamond',
		'touchend .wpg-timeline-track-point-diamond':'_onTouchEndDiamond',
		'touchend .wpg-popup__backdrop':'_closePopup',
		'click .wpg-popup__backdrop':'_closePopup',
		'change .wpg-timeline-track-point-second':'_changeSecond',
		'change .wpg-timeline-track-point-value':'_changeValue',
		'change .wpg-timeline-track-point__path-input':'_changePathValue',
		'change .wpg-timeline-track-point__polyline-input':'_changePolylineValue',
		'change .wpg-timeline-track-point-easing':'_changeEasing',
		'click .wpg-timeline-track-point-remove':'_removePoint',
		'keydown .wpg-timeline-track-point-diamond':'_onKeyDownDiamond'
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		const title = sprintf(
			__('%s at %ss', 'wpgraphicator'),
			this.model.get('value'),
			this.model.get('second')
		);
		const activeTrackPoints = this.getState('activeTrackPoints') || [];
		const propertyName = activeTrackPoints.length === 1 ? propertyNames[this.model.get('property')] :
		uniq(activeTrackPoints.map(point => {
			const property = point.model?.get('property');
			return propertyNames[property];
		})).join(' - ');
		return {
			cid:this.cid,
			title,
			easings,
			propertyName,
			parsePath,
			parsePoints
		};
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this._sortCollection = debounce(this._sortCollection.bind(this), 800);
		this._setLeft();
		this.listenTo(this.state, 'change:seconds change:secondWidth', this._setLeft);
		this.listenTo(this.model, 'change:second', this._setLeft);
		this.listenTo(this.state, 'change:activeTrackPoints', this._toggleActiveClass);
		this.listenTo(this.state, 'change:seconds', this._clampSecond);
		this.listenTo(this.state, 'change:trackPointViewShowPopup', this.render);
		this.listenTo(this.model, 'change:second change:value', this._updateTitle);
		this.setState('activeTrackPoints', [this]);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		const button = this.$('.wpg-timeline-track-point-diamond');
		const popup = this.$('.wpg-popup');
		if (popup.length){
			createPopperLite(button[0], popup[0], {
				placement:'top',
				strategy:'fixed',
				modifiers:[preventOverflow, flip]
			});
		}
		this.$('.wpg-color-picker').colorPicker({
			width:COLOR_PICKER_WIDTH,
			change:throttle((e, {color}) => this._changeValueWithPlugin(color.toString()), 200)
		});
		this.$('.wpg-gradient-picker').gradientPicker({
			width:COLOR_PICKER_WIDTH,
			gradient:parseGradient(this.model.get('value')),
			change:throttle((e, {gradient}) => this._changeValueWithPlugin(serializeGradient(gradient)), 200)
		});
		this.$('.wpg-range-slider').rangeSlider({
			value:this.model.get('value'),
			change:throttle((e, {value}) => this._changeValueWithPlugin(value), 200)
		});
		this.$('.wpg-stroke-dash-array-control').strokeDashArrayControl({
			labels:{
				addValue:__('Add Value', 'wpgraphicator'),
				dashes:__('Dashes', 'wpgraphicator'),
				gaps:__('Gaps', 'wpgraphicator')
			},
			value:this.model.get('value'),
			change:throttle((e, {value}) => this._changeValueWithPlugin(value), 200)
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_setLeft(){
		const secondWidth = this.getState('secondWidth');
		const second = this.model.get('second');
		this.$el.css('left', second * secondWidth);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {array} activeTrackPoints
	 */

	_toggleActiveClass(state, activeTrackPoints){
		this.$el.toggleClass('active', contains(activeTrackPoints, this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {integer} seconds
	 */

	_clampSecond(state, seconds){
		const sec = this.model.get('second');
		this.model.set('second', Math.min(sec, seconds));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changeSecond(e){
		const target = $(e.target);
		const second = parseFloat(target.val()) || 0;
		const seconds = this.getState('seconds');
		this.model.set('second', clamp(second, 0, seconds));
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changeEasing(e){
		const target = $(e.target);
		const easing = target.val();
		const activeTrackPoints = this.getState('activeTrackPoints') || [];
		if (activeTrackPoints.length === 1){
			this.model.set('easing', easing);
		} else {
			each(activeTrackPoints, point => point?.model.set('easing', easing));
		}
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changeValueWithPlugin(value){
		const shape = this._getSelectedShape();
		const property = this.model.get('property');
		this.model.set('value', value);
		if (replaceCollidedParams[property]){
			shape.set(property, replaceCollidedParams[property](value));
		} else {
			shape.set(property, value);
		}
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changeValue(e){
		if (!contains(animatables, this.model.get('property'))){
			return;
		}
		const target = $(e.target);
		const shape = this._getSelectedShape();
		const property = this.model.get('property');
		const value = parseFloat(target.val()) || 0;
		this.model.set('value', value);
		if (replaceCollidedParams[property]){
			shape.set(property, replaceCollidedParams[property](value));
		} else {
			shape.set(property, value);
		}
		if (shape.type === 'ellipse'){ // Update rx and ry also.
			if (property === 'width'){
				shape.set('rx', value / 2);
			} else if (property === 'height'){
				shape.set('ry', value / 2);
			}
		} else if (shape.type === 'circle' && property === 'radius'){ // Update width and height also.
			shape.set({
				width:value * 2,
				height:value * 2
			});
		}
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changePathValue(e){
		const target = $(e.target);
		const shape = this._getSelectedShape();
		const wrapper = target.closest('.wpg-timeline-track-point__path-input-wrapper');
		const path = wrapper
			.find('span, .wpg-input')
			.map((i, elem) => $(elem).val() || $(elem).text())
			.toArray()
			.join(' ');
		this.model.set('value', path);
		shape.set('path', replaceCollidedParams.path(value));
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changePolylineValue(e){
		const target = $(e.target);
		const shape = this._getSelectedShape();
		const wrapper = target.closest('.wpg-timeline-track-point__path-input-wrapper');
		const points = wrapper
			.find('.wpg-settings-shape__polyline-point')
			.map((i, elem) => $(elem).find('.wpg-input').map((i, el) => $(el).val()).toArray().join(','))
			.toArray()
			.join(' ');
		this.model.set('value', points);
		shape.set('points', replaceCollidedParams.points(value));
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_removePoint(e){
		e.preventDefault();
		this.sendNotice(
			removePoint,
			'warning',
			() => {
				this.setState('trackPointViewShowPopup', '');
				const activeTrackPoints = this.getState('activeTrackPoints') || [];
				if (activeTrackPoints.length === 1){
					this.model.collection.remove(this.model);
				} else {
					each(activeTrackPoints, point => {
						point.model?.collection.remove(point.model);
					});
				}
			},
			true
		);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_openPopup(e){
		e.preventDefault();
		this.setState('trackPointViewShowPopup', this.cid);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_closePopup(){
		this.setState('trackPointViewShowPopup', '');
	},

	/**
	 * Here we emulate long touch event so that open the track point popup.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onTouchStartDiamond(e){
		e.preventDefault();
		this.__touchStartTimeStamp = Date.now();
	},

	/**
	 * Here we only save x coordinate on touch move to check
	 * whether it was a move or only a long click at the end of touch.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onTouchMoveDiamond(e){
		this.__touchMove = e.touches[0].clientX;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_onTouchEndDiamond(){
		if (this.__touchMove){
			this.__touchMove = null;
			this._sortCollection();
			return;
		}
		if (Date.now() - this.__touchStartTimeStamp > 400){
			this.setState('trackPointViewShowPopup', this.cid);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_focusDiamond(e){
		e?.preventDefault();
		this.$('.wpg-timeline-track-point-diamond').trigger('focus');
		this.__focused = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_sortCollection(){
		this.model?.collection.sort();
		// After model's collection have sorted, we rerender the views.
		// So we need to refocus on diamond if we focused before.
		// And we need to check, whether the point is visible for fixing css left bug,
		// When the parent is overflow: hidden, and the element is focused.
		const left = parseInt(this.$el.css('left'));
		const trackWidth = this.$el.closest('.wpg-timeline-shape__tracks').width();
		const timelineLeft = this.getState('timelineLeft');
		const visibleRight = (left + timelineLeft < trackWidth);
		const visibleLeft = (left + timelineLeft >= 0);
		if (this.__focused && contains(this.getState('activeTrackPoints'), this) && visibleRight && visibleLeft){
			this.__focused = false;
			this._focusDiamond();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} model
	 */

	_updateTitle(model){
		const title = sprintf(
			__('%s at %ss', 'wpgraphicator'),
			model.get('value'),
			model.get('second')
		);
		this.$('.wpg-timeline-track-point-diamond').attr('title', title);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onKeyDownDiamond(e){
		const seconds = this.getState('seconds');
		const second = this.model.get('second');
		const n = 1 / 10 ** FRACTION_DIGITS;
		const activeTrackPoints = this.getState('activeTrackPoints') || [];
		const shapeIds = uniq(activeTrackPoints.map(point => point.model?.get('shapeId'))) || [];
		const models = shapeIds.map(id => this.shapes.get(id));
		const shapes = shapeIds.map(id => this.scene.getObjectById(id));
		switch (e.keyCode){
			case 39: // Arrow right
			e.preventDefault();
			if (activeTrackPoints.length === 1){
				this.model.set('second', toFixed(Math.min(second + n, seconds)));
			} else {
				each(activeTrackPoints, point => {
					const sec = point.model?.get('second');
					point.model?.set('second', toFixed(Math.min(sec + n, seconds)));
				});
				if (shapes.length > 1){
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shapes);
				}
			}
			this._sortCollection();
			break;
			case 37: // Arrow left
			e.preventDefault();
			if (activeTrackPoints.length === 1){
				this.model.set('second', toFixed(Math.max(second - n, 0)));
			} else {
				each(activeTrackPoints, point => {
					const sec = point.model?.get('second');
					point.model?.set('second', toFixed(Math.max(sec - n, 0)));
				});
				if (shapes.length > 1){
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shapes);
				}
			}
			this._sortCollection();
			break;
			case 38: // Arrow up
			e.preventDefault();
			if (activeTrackPoints.length === 1){
				this.model.set('second', toFixed(Math.min(Math.round(second) + 1, seconds)));
			} else {
				each(activeTrackPoints, point => {
					const sec = point.model?.get('second');
					point.model?.set('second', toFixed(Math.min(Math.round(sec) + 1, seconds)));
				});
				if (shapes.length > 1){
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shapes);
				}
			}
			this._sortCollection();
			break;
			case 40: // Arrow down
			e.preventDefault();
			if (activeTrackPoints.length === 1){
				this.model.set('second', toFixed(Math.max(Math.round(second) - 1, 0)));
			} else {
				each(activeTrackPoints, point => {
					const sec = point.model?.get('second');
					point.model?.set('second', toFixed(Math.max(Math.round(sec) - 1, 0)));
				});
				if (shapes.length > 1){
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shapes);
				}
			}
			this._sortCollection();
			break;
			case 74: // J
			if (activeTrackPoints.length === 1){
				this.model.set('second', this.getState('currentTime'));
			} else {
				each(activeTrackPoints, point => {
					point.model?.set('second', this.getState('currentTime'));
				});
				if (shapes.length > 1){
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shapes);
				}
			}
			break;
			case 32: // Space
			this._openPopup(e);
			break;
			case 67: // C
			if (e.ctrlKey){
				if (activeTrackPoints.length === 1){
					this.clipboard.copy(this.model, 'transition');
				} else {
					this.clipboard.copy(activeTrackPoints.map(point => point.model), 'transition');
				}
			}
			break;
			case 46: // Delete
			this._removePoint(e);
			break;
			default:
			break;
		}
	},

	/**
	 *
	 * @since 1.2.0
	 * @return {object}
	 */

	_getSelectedShape(){
		return this.scene.getActiveObject() || {};
	}

});
