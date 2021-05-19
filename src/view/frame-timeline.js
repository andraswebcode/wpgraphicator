import $ from 'jquery';

import Frame from './frame.js';
import TimelineTimeslider from './subview-timeline-timeslider.js';
import TimelineShape from './subview-timeline-shape.js';
import {
	clamp,
	toFixed
} from './../utils/utils.js';
import {
	FRACTION_DIGITS
} from './../utils/constants.js';

/**
 * Timeline frame.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Frame
 * @augments Backbone.View
 */

export default Frame.extend(/** @lends Timeline.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'mousemove':'_moveTimesliderCursor',
		'touchmove':'_moveTimesliderCursor',
		'mousedown .wpg-timeline__current-time':'_onMouseDownCurrentTime',
		'touchstart .wpg-timeline__current-time':'_onMouseDownCurrentTime',
		'click .wpg-timeline-topbar-play-button':'_playPause',
		'keydown .wpg-timeline__current-time':'_onKeyDownCurrentTime'
	},

	/**
	 * Body events.
	 * @since 1.0.0
	 * @var {object}
	 */

	bodyEvents:{
		'mousemove':'_onMouseMoveCurrentTime',
		'touchmove':'_onMouseMoveCurrentTime',
		'mouseup mouseleave':'_onMouseUpCurrentTime',
		'touchend':'_onMouseUpCurrentTime'
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:TimelineTimeslider,
			model:this.state,
			renderOnChange:['seconds', 'secondWidth', 'timelineLeft']
		});
		this.views.add({
			view:TimelineShape,
			collection:this.shapes,
			renderOnChange:['name']
		});
		this._setTimer(this.state, this.getState('currentTime'));
		this.listenTo(this.state, 'change:currentTime change:secondWidth change:timelineLeft', this._moveCurrentTime);
		this.listenTo(this.state, 'change:currentTime', this._setTimer);
		this.listenTo(this.state, 'change:isPlaying', this._changePlayButtonIcon);
		this.$document.on('keydown', this._onDocumentKeyDown.bind(this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_moveTimesliderCursor(e){
		const clientX = ('ontouchstart' in window && e.touches) ? e.touches[0].clientX : e.clientX;
		const offset = this.$('.wpg-timeline-timeslider').offset();
		const cursor = this.$('.wpg-timeline-timeslider-cursor');
		const seconds = this.getState('seconds');
		const secondWidth = this.getState('secondWidth');
		cursor.css('left', toFixed(clamp(clientX - offset.left, 0, seconds * secondWidth)));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseDownCurrentTime(e){
		e.preventDefault();
		this.__currentTimeIsDragging = true;
		// Focusing needs for keyboard events.
		// Not focusing automatically because of prevented defaults.
		this.$('.wpg-timeline__current-time').trigger('focus');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseMoveCurrentTime(e){
		if (!this.__currentTimeIsDragging){
			return;
		}
		const clientX = ('ontouchstart' in window && e.touches) ? e.touches[0].clientX : e.clientX;
		const secondWidth = this.getState('secondWidth');
		const offset = this.$('.wpg-timeline-timeslider').offset();
		const currentTime = (clientX - offset.left) / secondWidth;
		const seconds = this.getState('seconds');
		this.setState('currentTime', toFixed(clamp(currentTime, 0, seconds)));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseUpCurrentTime(e){
		this.__currentTimeIsDragging = false;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_playPause(e){
		e.preventDefault();
		const isPlaying = this.getState('isPlaying');
		this.setState('isPlaying', !isPlaying);
		if (isPlaying){
			this.anime.pause();
		} else {
			this.anime.play();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onKeyDownCurrentTime(e){
		const currentTime = this.getState('currentTime');
		const seconds = this.getState('seconds');
		const n = 1 / 10 ** FRACTION_DIGITS;
		switch (e.keyCode){
			case 39: // Arrow right
			e.preventDefault();
			this.setState('currentTime', Math.min(currentTime + n, seconds));
			break;
			case 37: // Arrow left
			e.preventDefault();
			this.setState('currentTime', Math.max(currentTime - n, 0));
			break;
			case 38: // Arrow up
			e.preventDefault();
			this.setState('currentTime', Math.min(Math.round(currentTime) + 1, seconds));
			break;
			case 40: // Arrow down
			e.preventDefault();
			this.setState('currentTime', Math.max(Math.round(currentTime) - 1, 0));
			break;
			case 36: // Home
			e.preventDefault();
			this.setState('currentTime', 0);
			break;
			case 35: // End
			e.preventDefault();
			this.setState('currentTime', this.getState('seconds'));
			break;
			default:
			break;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 */

	_moveCurrentTime(state){
		const currentTime = state.get('currentTime');
		const secondWidth = state.get('secondWidth');
		const timelineLeft = state.get('timelineLeft');
		const left = secondWidth * currentTime + timelineLeft;
		this.$('.wpg-timeline__current-time').css('left', left);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {float} currentTime
	 */

	_setTimer(state, currentTime){
		const timer = this.$('.wpg-timeline-topbar-timer');
		const date = new Date(null);
		date.setMilliseconds(currentTime * 1000);
		const time = date.toISOString().substring(14, 22);
		timer.text(time);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {boolean} isPlaying
	 */

	_changePlayButtonIcon(state, isPlaying){
		const btn = this.$('.wpg-timeline-topbar-play-button').find('.fas');
		if (isPlaying){
			btn.removeClass('fa-play').addClass('fa-pause');
		} else {
			btn.removeClass('fa-pause').addClass('fa-play');
		}
	},

	/**
	 * This method moved from subview TimelineTrackPoint.prototype.
	 * Important that document onkeydown events must be put in a single view.
	 * If we put that in a collection view it will be triggered
	 * as many times as there are collection views exist.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_pasteTrackPoint(e){
		if (e.keyCode !== 86 || !(e.ctrlKey || e.metaKey)){
			return;
		}
		const activeShape = this.scene.getActiveObject();
		if (!activeShape){
			return;
		}
		const shapeId = activeShape.id;
		const shapeModel = this.shapes.get(shapeId);
		this.clipboard.paste(model => {
			const transitionModel = model.clone();
			const property = model.get('property');
			const propModel = shapeModel._properties.get(property) || shapeModel._properties.add({
				id:property,
				shapeId
			});
			transitionModel.set({
				shapeId,
				second:this.getState('currentTime')
			});
			propModel._transitions.add(transitionModel);
			propModel._transitions.sort();
		}, 'transition');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onDocumentKeyDown(e){
		switch (e.keyCode){
			case 86: // V
			this._pasteTrackPoint(e);
			break;
			case 32: // Space
			const focus = this.$body.find('input, button').is(':focus');
			const shape = this.scene.getActiveObject();
			const isEditing = (shape && shape.isEditing);
			if (!this.getState('trackPointViewShowPopup') && !focus && !isEditing){
				this._playPause(e);
			}
			break;
			default:
			break;
		}
	}

});
