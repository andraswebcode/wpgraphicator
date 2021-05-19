import $ from 'jquery';
import {
	clone,
	debounce,
	each,
	keys as _keys
} from 'underscore';
import {
	util
} from 'fabric';

import Subview from './subview.js';
import TimelineTrackPoint from './subview-timeline-track-point.js';
import {
	clamp,
	toFixed,
	animatables,
	replaceCollidedParams
} from './../utils/utils.js';

/**
 * Timeline track subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends TimelineTrack.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline-track',

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'mousedown':'_onMouseDown',
		'touchstart':'_onMouseDown'
	},

	/**
	 * Body events.
	 * @since 1.0.0
	 * @var {object}
	 */

	bodyEvents:{
		'mousemove':'_onMouseMove',
		'touchmove':'_onMouseMove',
		'mouseup mouseleave':'_onMouseUp',
		'touchend':'_onMouseUp'
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:TimelineTrackPoint,
			collection:this.model._transitions
		});
		setTimeout(this._setAnime.bind(this), 2);
		this.listenTo(this.model._transitions, 'add change remove sort', debounce(this._setAnime.bind(this), 100));
		this.listenTo(this.model._transitions, 'remove', this._removePropertyIfEmpty);
		this.listenTo(this.state, 'change:currentTime', this._seekAnime);
		this.scene.on('mouse:down', this._resetActiveTrackPoints.bind(this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_setAnime(){
		const id = this.model.get('shapeId');
		const currentTime = this.getState('currentTime');
		const keyframes = this.model.collection ? this.model.collection.toAnime() : {};
		const animateds = _keys(keyframes);
		const shape = this.scene.getObjectById(id);
		const anime = this.anime;
		if (!shape){
			return;
		}
		keyframes.targets = shape._animationCache;
		keyframes.update = () => {
			each(animateds, prop => {
				const val = shape._animationCache[prop];
				const value = replaceCollidedParams[prop] ? replaceCollidedParams[prop](val) : val;
				shape.set(prop, value);
				if (shape.type === 'ellipse'){ // Update rx and ry also.
					if (prop === 'width'){
						shape.set('rx', value / 2);
					} else if (prop === 'height'){
						shape.set('ry', value / 2);
					}
				}
			});
		};
		anime.remove(shape._animationCache);
		anime.add(keyframes, 0);
		anime.seek(currentTime * 1000);
		this.setState('totalDuration', anime.duration / 1000);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {float} currentTime
	 */

	_seekAnime(state, currentTime){
		if (!this.getState('isPlaying')){
			this.anime.seek(currentTime * 1000);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} model
	 * @param {object} collection
	 */

	_removePropertyIfEmpty(model, collection){
		if (collection.length === 0){
			this.model.collection.remove(this.model);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseDown(e){
		const target = $(e.target);
		const cid = target.data('cid') || target.parent().data('cid');
		const pointView = this.views.getByCid('timeline-track-point', cid);
		if (pointView){
			this.setState('activeTrackPoints', [pointView]);
		} else {
			this._resetActiveTrackPoints();
		}
		this.__isDragging = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseMove(e){
		if (!this.__isDragging || this.getState('trackPointViewShowPopup')){
			return;
		}
		if (!this.__isMoving){
			this.__isMoving = true;
			return;
		}
		const activeTrackPoints = this.getState('activeTrackPoints');
		if (!activeTrackPoints || !activeTrackPoints.length){
			return;
		}
		const pointView = activeTrackPoints[0];
		if (!pointView){
			return;
		}
		const clientX = ('ontouchstart' in window) ? e.touches[0].clientX : e.clientX;
		const offsetX = clientX - this.$el.offset().left;
		const secondWidth = this.getState('secondWidth');
		const seconds = this.getState('seconds');
		const second = toFixed(offsetX / secondWidth);
		pointView.model.set({
			second:clamp(second, 0, seconds)
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onMouseUp(e){
		this.__isDragging = false;
		this.__isMoving = false;
		if ('ontouchstart' in window){
			this._resetActiveTrackPoints();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_resetActiveTrackPoints(){
		this.setState('activeTrackPoints', []);
	}

});
