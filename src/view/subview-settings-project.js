import $ from 'jquery';
import {
	throttle,
	debounce
} from 'underscore';

import Subview from './subview.js';
import {
	notificationMessages,
	clamp
} from './../utils/utils.js';
import {
	MAX_SECONDS,
	COLOR_PICKER_WIDTH
} from './../utils/constants.js';

const {
	changeProjectWidth,
	changeProjectHeight,
	changeProjectDuration
} = notificationMessages;

/**
 * Settings project subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends SettingsProject.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'settings-project',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'change .wpg-input':'_setProjectState',
		'click .wpg-settings-project__copy-shortcode-button':'_copyShortcodeToClipboard',
		'click .wpg-settings-project__open-shortcode-generator':'_openShortcodeGenerator'
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.state, 'change:projectBackground', debounce(this.render.bind(this), 800));
	},

	/**
	 * Initialize plugins after underscore template rendered.
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		this.$('.wpg-color-picker').colorPicker({
			width:COLOR_PICKER_WIDTH,
			change:throttle((e, {color}) => this.setState('projectBackground', color.toString()), 200)
		});
		// Refocus on input.
		if (this.__focusedInput){
			setTimeout(() => {
				this.$('#' + this.__focusedInput).trigger('focus');
				this.__focusedInput = null;
			}, 20);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setProjectState(e){
		const input = $(e.target);
		const state = input.data('state');
		if (!state){
			return;
		}
		if (state === 'seconds'){
			this.setState({
				timelineLeft:0,
				currentTime:0
			});
		}
		// Save input that we focused on to refocus on rerender.
		this.__focusedInput = input.attr('id');
		if (state === 'projectName'){
			this.setState(state, input.val());
			return;
		}
		const message = state === 'projectWidth' ? changeProjectWidth :
			state === 'projectHeight' ? changeProjectHeight :
			changeProjectDuration;
		if (!this.shapes.length){
			let value = parseInt(input.val()) || 0;
				value = state === 'seconds' ? clamp(value, 1, MAX_SECONDS) : Math.max(1, value);
			this.setState(state, value);
			return;
		}
		if (!this[`__${state}ChangeNotClicked`]){
			this.sendNotice(
				message,
				'warning',
				() => {
					let value = parseInt(input.val()) || 0;
						value = state === 'seconds' ? clamp(value, 1, MAX_SECONDS) : Math.max(1, value);
					this.setState(state, value);
					this[`__${state}ChangeNotClicked`] = false;
				},
				() => {
					this.render();
					this[`__${state}ChangeNotClicked`] = false;
				}
			);
		}
		this[`__${state}ChangeNotClicked`] = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_copyShortcodeToClipboard(e){
		e.preventDefault();
		const input = this.$('.wpg-settings-project__copy-shortcode-input');
		input.trigger('select'); // Select with jquery.
		input[0].setSelectionRange(0, 100); // For mobile devices.
		this.$document[0].execCommand('copy');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_openShortcodeGenerator(e){
		e.preventDefault();
		this.setState('topbarMenuShowModal', 'shortcode-generator');
	}

});
