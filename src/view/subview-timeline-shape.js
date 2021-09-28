import $ from 'jquery';
import {
	contains,
	throttle,
	without
} from 'underscore';
import {
	ActiveSelection
} from 'fabric';

import Subview from './subview.js';
import TimelineSidebarTrack from './subview-timeline-sidebar-track.js';
import TimelineTrack from './subview-timeline-track.js';
import {
	shapeNames,
	notificationMessages,
	clamp,
	toFixed
} from './../utils/utils.js';

/**
 * Timeline shape subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends TimelineShape.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline-shape',

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'mousedown .wpg-timeline-shape__process-bar-strip':'_onMouseDownProcessStrip',
		'touchstart .wpg-timeline-shape__process-bar-strip':'_onMouseDownProcessStrip',
		'click .wpg-timeline-shape__grip-button':'_setActiveShape',
		'change .wpg-timeline-shape__change-name-input':'_changeShapeName',
		'click .wpg-remove-item-button':'_removeItem',
		'keydown .wpg-timeline-shape__process-bar-strip':'_onKeyDownProcessStrip'
	},

	/**
	 * Body events.
	 * @since 1.0.0
	 * @var {object}
	 */

	bodyEvents:{
		'mouseup mouseleave':'_onMouseUpProcessStrip',
		'touchend':'_onMouseUpProcessStrip'
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		return {
			shapeName:shapeNames[this.model.get('type')]
		};
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:TimelineSidebarTrack,
			collection:this.model._properties
		});
		this.views.add({
			view:TimelineTrack,
			collection:this.model._properties
		});
		this.listenTo(this.state, 'change:selectedShapeIds', this._toggleActiveClass);
		this.listenTo(this.state, 'change:timelineLeft', this._setLeft);
		this.listenTo(this.state, 'change:seconds change:secondWidth', this._setWidth);
		this.listenTo(this.state, 'change:seconds change:secondWidth', this._setProcessStrip);
		this.listenTo(this.model, 'change:start change:duration', this._setProcessStrip);
		this.listenTo(this.model._properties, 'remove', this._setAnime);
		this.$body.on('mousemove touchmove', throttle(this._onMouseMoveProcessStrip.bind(this), 40));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {array} selectedShapeIds
	 */

	_toggleActiveClass(state, selectedShapeIds){
		this.$el.toggleClass('active', contains(selectedShapeIds, this.model.get('id')));
	},

	/**
	 * Set timeline's left css value.
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {float} timelineLeft
	 */

	_setLeft(state, timelineLeft){
		this.$('.wpg-timeline-shape__tracks-inner').css('left', timelineLeft);
	},

	/**
	 * Set timeline's width css value.
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {float} timelineLeft
	 */

	_setWidth(state){
		const width = state.get('seconds') * state.get('secondWidth');
		this.$('.wpg-timeline-shape__tracks-inner').width(width);
	},

	/**
	 * Set left and width css value of the process bar strip.
	 * @since 1.0.0
	 * @access private
	 * @param {object} model
	 */

	_setProcessStrip(model){
		const start = this.model.get('start');
		const duration = this.model.get('duration');
		const secondWidth = this.getState('secondWidth');
		this.$('.wpg-timeline-shape__process-bar-strip').css({
			width:duration * secondWidth,
			left:start * secondWidth
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setAnime(){
		const trackViews = this.views.views['timeline-track'] || [];
		if (trackViews.length){
			trackViews[0]._setAnime();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setActiveShape(e){
		const id = this.model.get('id');
		const shapeIds = this.getState('selectedShapeIds') || [];
		const ctrlKey = (e.ctrlKey || e.metaKey);
		if (ctrlKey && shapeIds.length && shapeIds[0]){
			const newShape = this.scene.getObjectById(id);
			this.scene.discardActiveObject();
			let objects = shapeIds.map(id => this.scene.getObjectById(id));
			if (contains(shapeIds, id)){
				objects = without(objects, newShape);
			} else {
				objects.push(newShape);
			}
			const activeSelection = new ActiveSelection(objects, {
				canvas:this.scene
			});
			this.scene.setActiveObject(activeSelection).requestRenderAll();
		} else {
			const shape = this.scene.getObjectById(id);
			this.scene.setActiveObject(shape).requestRenderAll();
		}
		this.setState('activeTool', 'select-mode');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_changeShapeName(e){
		const name = $(e.target).val();
		this.model.set('name', name);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseDownProcessStrip(e){
		e.preventDefault();
		this.__startX = ('ontouchstart' in window) ? e.touches[0].clientX : e.clientX;
		this.$('.wpg-timeline-shape__process-bar-strip').trigger('focus');
		this.setState('activeTrackPoints', []);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseMoveProcessStrip(e){
		if (!this.__startX){
			return;
		}
		const clientX = ('ontouchstart' in window) ? e.touches[0].clientX : e.clientX;
		const distance = clientX - this.__startX;
		const secondWidth = this.getState('secondWidth');
		this.__setAllTransition(toFixed(distance / secondWidth));
		this.__startX = clientX;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseUpProcessStrip(e){
		this.__startX = null;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onKeyDownProcessStrip(e){
		const start = this.model.get('start');
		switch (e.keyCode){
			case 39: // Arrow right
			e.preventDefault();
			this.__setAllTransition(0.01);
			break;
			case 37: // Arrow left
			e.preventDefault();
			this.__setAllTransition(-0.01);
			break;
			case 38: // Arrow up
			e.preventDefault();
			this.__setAllTransition(Math.round(start) - start + 1);
			break;
			case 40: // Arrow down
			e.preventDefault();
			this.__setAllTransition(Math.round(start) - start - 1);
			break;
			case 46: // Delete
			e.preventDefault();
			this.sendNotice(
				notificationMessages.removeAllPoints,
				'warning',
				() => {
					this.model._properties.set([]);
				},
				true
			);
			break;
			default:
			break;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {number} distance In second.
	 */

	__setAllTransition(distance = 0){
		const start = this.model.get('start');
		const end = start + this.model.get('duration');
		const seconds = this.getState('seconds');
		this.model._properties.each(property => {
			property._transitions.each(transition => {
				const second = transition.get('second');
				transition.set('second', clamp(toFixed(second + distance), second - start, seconds - (end - second)));
			});
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_removeItem(e){
		e.preventDefault();
		const id = this.model.get('id');
		const shape = this.scene.getObjectById(id);
		this.sendNotice(
			notificationMessages.removeShape,
			'warning',
			() => {
				this.scene.remove(shape);
				this.anime.remove(shape._animationCache);
				this.setState('totalDuration', this.anime.duration / 1000);
			},
			true
		);
	}

});
