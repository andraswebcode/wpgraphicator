import $ from 'jquery';
import {
	is_rtl
} from 'wpgeditor';

import Subview from './subview.js';
import {
	clamp,
	toFixed
} from './../utils/utils.js';
import {
	MIN_SECOND_WIDTH,
	MAX_SECOND_WIDTH
} from './../utils/constants.js';

/**
 * Timeline timeslider subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends TimelineTimeslider.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline-timeslider',

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'mousedown':'_onMouseDown',
		'touchstart':'_onTouchStart'
	},

	/**
	 * Body events.
	 * @since 1.0.0
	 * @var {object}
	 */

	bodyEvents:{
		'mousemove':'_onMouseMove',
		'mouseleave mouseup':'_onMouseUp',
		'touchmove':'_onTouchMove',
		'touchend':'_onTouchEnd'
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.state, 'change:timelineLeft', this._setLeft);
	},

	/**
	 * Set timeslider's left css value.
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {float} timelineLeft
	 */

	_setLeft(state, timelineLeft){
		this.$el.css('left', timelineLeft);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseDown(e){
		e.preventDefault();
		this.__startX = e.clientX;
		this.__startY = e.clientY;
		this.__prevPositionX = this.getState('timelineLeft');
		this.__prevSecondWidth = this.getState('secondWidth');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseMove(e){
		if (!this.__startX || !this.__startY){
			return;
		}
		const x = this.__prevPositionX + (e.clientX - this.__startX);
		const y = this.__prevSecondWidth + (this.__startY - e.clientY) / 5;
		const secondWidth = clamp(y, MIN_SECOND_WIDTH, MAX_SECOND_WIDTH);
		const seconds = this.getState('seconds');
		this.setState({
			timelineLeft:clamp(x, - (seconds - 1) * secondWidth, 0),
			secondWidth
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseUp(e){
		const target = $(e.target);
		const isTimeSlider = target.is('.wpg-timeline-timeslider');
		if (e.type === 'mouseup' && isTimeSlider && this.__startX === e.clientX){
			const secondWidth = this.getState('secondWidth');
			const seconds = this.getState('seconds');
			const offsetX = e.clientX - this.$el.offset().left;
			const currentTime = toFixed(offsetX / secondWidth);
			this.setState('currentTime', clamp(is_rtl ? seconds - currentTime : currentTime, 0, seconds));
		}
		this.__startX = null;
		this.__startY = null;
		this.__prevPositionX = null;
		this.__prevSecondWidth = null;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onTouchStart(e){
		e.preventDefault();
		const touches = e.touches;
		this.__start = touches[0].clientX;
		if (touches.length === 2){
			this.__startDistance = Math.abs(touches[0].clientX - touches[1].clientX);
		}
		this.__prevPosition = this.getState('timelineLeft');
		this.__prevSecondWidth = this.getState('secondWidth');
		this.__touchTarget = $(e.target);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onTouchMove(e){
		const touches = e.touches;
		const seconds = this.getState('seconds');
		const secondWidth = this.getState('secondWidth');
		if (touches.length === 1 && this.__start){
			const left = this.__prevPosition + (touches[0].clientX - this.__start);
			this.setState('timelineLeft', clamp(left, - (seconds - 1) * secondWidth, 0));
		} else if (touches.length === 2 && this.__startDistance){
			const moveDistance = Math.abs(touches[0].clientX - touches[1].clientX);
			const distance = moveDistance - this.__startDistance;
			this.setState('secondWidth', clamp(this.__prevSecondWidth + distance, MIN_SECOND_WIDTH, MAX_SECOND_WIDTH));
		}
		this.__hasTouchMove = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_onTouchEnd(){
		if (!this.__hasTouchMove && this.__touchTarget && this.__touchTarget.is('.wpg-timeline-timeslider') && this.__start){
			const secondWidth = this.getState('secondWidth');
			const seconds = this.getState('seconds');
			const offsetX = this.__start - this.$el.offset().left;
			const currentTime = toFixed(offsetX / secondWidth);
			this.setState('currentTime', clamp(is_rtl ? seconds - currentTime : currentTime, 0, seconds));
		}
		this.__start = null;
		this.__startDistance = null;
		this.__prevPosition = null;
		this.__prevSecondWidth = null;
		this.__hasTouchMove = false;
	}

});
