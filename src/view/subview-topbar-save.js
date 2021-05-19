import $ from 'jquery';
import {
	version
} from 'wpgeditor';

import Subview from './subview.js';
import {
	notificationMessages
} from './../utils/utils.js';
import {
	MOBILE_BREAKPOINT
} from './../utils/constants.js';

const {
	saveSuccess,
	updateSuccess,
	saveFailed
} = notificationMessages;

/**
 * Topbar save subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends TopbarSave.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'topbar-save',

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-topbar-save-button':'_saveProject',
		'click .wpg-topbar-open-settings-button':'_toggleSettings'
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.$document.on('keydown', this._onDocumentKeyDown.bind(this));
		this.$window.on('resize', this._showSettings.bind(this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_saveProject(e){
		e.preventDefault();
		const status = $(e.target).data('status') || 'draft';
		this.__saveProject(status);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_toggleSettings(e){
		e.preventDefault();
		$('#wpg-editor').find('#wpg-frame__settings').toggle();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_showSettings(){
		if (this.$window.width() > MOBILE_BREAKPOINT){
			$('#wpg-editor').find('#wpg-frame__settings').show();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onDocumentKeyDown(e){
		if (e.ctrlKey || e.metaKey){
			if (e.keyCode === 83){ // S
				e.preventDefault();
				$('.wpg-topbar__loader').show();
				this.__saveProject('publish');
			} else if (e.keyCode === 68){ // D
				e.preventDefault();
				$('.wpg-topbar__loader').show();
				this.__saveProject('draft');
			}
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {string} status
	 */

	__saveProject(status = 'draft'){
		const svg = this._getProjectSvg();
		const successMessage = this.project.get('id') ? updateSuccess : saveSuccess;
		this.shapes.each((shape, i) => shape.set('zIndex', i));
		this.project.save({
			title:this.getState('projectName'),
			content:svg.replace(/\n|\t/g, ''),
			status,
			meta:{
				wpgraphicator_project:{
					width:this.getState('projectWidth'),
					height:this.getState('projectHeight'),
					seconds:this.getState('seconds'),
					background:this.getState('projectBackground'),
					version
				},
				wpgraphicator_transitions:this.shapes.toJSON()
			}
		},{
			success:() => {
				this.sendNotice(
					successMessage,
					'success'
				);
			},
			error:() => {
				this.sendNotice(
					saveFailed,
					'error'
				);
				setTimeout(() => {
					$('.wpg-topbar__loader').hide();
				}, 20);
			}
		});
	},

	/**
	 * Prepare and export svg to save.
	 * @since 1.0.0
	 * @access private
	 * @return {string} Svg string.
	 */

	_getProjectSvg(){
		// Stop animation if it is playing.
		this.anime.pause();
		this.setState('isPlaying', false);
		const scene = this.scene;
		const width = this.getState('projectWidth');
		const height = this.getState('projectHeight');
		// Save states.
		const vpt = scene.viewportTransform.slice();
		const clipPath = scene.clipPath;
		const sceneBg = scene.backgroundColor;
		const backgroundColor = this.getState('projectBackground');
		const currentTime = this.getState('currentTime');
		// Prepare scene to export svg by remove helper things that we don't want to save.
		scene.setViewportTransform([1, 0, 0, 1, 0, 0]);
		scene.clipPath = null;
		scene.backgroundColor = null;
		this.setState('currentTime', 0);
		const svg = scene.toSVG({
			suppressPreamble:true,
			width,
			height,
			backgroundColor
		}, svg => svg.replace(/(transform="matrix\(0\s)/g, 'transform="matrix(0.000001 '));
		// Restore the helper things.
		scene.setViewportTransform(vpt);
		scene.clipPath = clipPath;
		scene.setBackgroundColor(sceneBg);
		this.setState('currentTime', currentTime);
		return svg;
	}

});
