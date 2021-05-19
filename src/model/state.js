import {
	Model
} from 'backbone';
import {
	DEFAULT_SECONDS,
	DEFAULT_SECOND_WIDTH,
	DEFAULT_PROJECT_WIDTH,
	DEFAULT_PROJECT_HEIGHT,
	DEFAULT_BACKGROUND_COLOR,
	DEFAULT_GRID_SIZE,
	DEFAULT_EASING,
	DEFAULT_STROKE_WIDTH,
	DEFAULT_STROKE_COLOR,
	DEFAULT_FILL_COLOR,
	DEFAULT_ACTIVE_SETTINGS_TABS
} from './../utils/constants.js';

/**
 * State model.
 * @since 1.0.0
 * @class
 * @augments Backbone.Model
 */

export default Model.extend(/** @lends State.prototype */{

	/**
	 * Model defaults.
	 * @since 1.0.0
	 * @var {object}
	 */

	defaults:{
		currentTime:0,
		timelineLeft:0,
		seconds:DEFAULT_SECONDS,
		secondWidth:DEFAULT_SECOND_WIDTH,
		projectWidth:DEFAULT_PROJECT_WIDTH,
		projectHeight:DEFAULT_PROJECT_HEIGHT,
		projectName:'',
		projectID:0,
		projectBackground:DEFAULT_BACKGROUND_COLOR,
		topbarMenuActiveDropdown:'',
		topbarMenuShowModal:'',
		gridSize:DEFAULT_GRID_SIZE,
		snapToGrid:false,
		selectedShapeIds:[''],
		activeTrackPoints:[],
		trackPointViewShowPopup:'',
		defaultEasing:DEFAULT_EASING,
		activeSettingsTabs:DEFAULT_ACTIVE_SETTINGS_TABS,
		activeTool:'select-mode',
		activeStrokeWidth:DEFAULT_STROKE_WIDTH,
		activeStrokeColor:DEFAULT_STROKE_COLOR,
		activeFillColor:DEFAULT_FILL_COLOR,
		isPlaying:false,
		totalDuration:0,
		shortcodeParams:{},
		pointerPosition:{
			x:0,
			y:0
		}
	}

});
