import {
	i18n
} from 'wordpress';

import Subview from './subview.js';
import {
	clamp,
	toFixed
} from './../utils/utils.js';

const {
	_n,
	sprintf
} = i18n;

/**
 * Settings stats subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends SettingsStats.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'settings-stats',

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.shapes, 'add remove', this.render);
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		const activeShape = this.scene.getActiveObject();
		const pointerPosition = this.getState('pointerPosition');
		const strokeLength = activeShape && activeShape.getStrokeLength();
		let localPosition = {};
		if (activeShape){
			localPosition = activeShape.toLocalPoint(pointerPosition, 'left', 'top');
			localPosition = {
				x:clamp(localPosition.x, 0, activeShape.width),
				y:clamp(localPosition.y, 0, activeShape.height)
			};
		}
		return {
			hasActiveShape:!!activeShape,
			localPosition,
			strokeLength,
			layersCount:this.shapes.length,
			getTotalDuration:this._getTotalDuration.bind(this)
		};
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {string}
	 */

	_getTotalDuration(){
		const duration = this.getState('totalDuration');
		return sprintf(_n('%s second', '%s seconds', duration, 'wpgraphicator'), toFixed(duration));
	}

});
