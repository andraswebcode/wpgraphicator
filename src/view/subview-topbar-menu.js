import $ from 'jquery';
import {
	reduce,
	clone,
	omit
} from 'underscore';
import {
	i18n
} from 'wordpress';
import {
	playing_modes,
	preserve_aspect_ratio_values
} from 'wpgeditor';

import Subview from './subview.js';
import Project from './frame-project.js';
import TopbarSave from './subview-topbar-save.js';
import {
	notificationMessages,
	keyboardShortcuts,
	easings
} from './../utils/utils.js';

const {
	__
} = i18n;
const {
	removeShape,
	removeAllShapes,
	removePoint,
	removeAllPoints
} = notificationMessages;

/**
 * Topbar menu subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 * @mixes Project
 * @mixes TopbarSave
 */

export default Subview.extend(/** @lends TopbarMenu.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'topbar-menu',

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @access private
	 * @var {number}
	 */

	_svgUniqueId:0,

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		const snapToGrid = this.getState('snapToGrid');
		return {
			menuItems:[{
				name:'edit',
				title:__('Edit', 'wpgraphicator'),
				items:[{
					name:'undo',
					title:__('Undo', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'delete-shape',
					title:__('Delete Selected Shape', 'wpgraphicator')
				},{
					name:'copy-shape',
					title:__('Copy Selected Shape', 'wpgraphicator')
				},{
					name:'paste-shape',
					title:__('Paste Shape', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'clear-canvas',
					title:__('Clear Canvas', 'wpgraphicator')
				}]
			},{
				name:'animation',
				title:__('Animation', 'wpgraphicator'),
				items:[{
					name:'delete-transition',
					title:__('Delete Selected Keyframe', 'wpgraphicator')
				},{
					name:'copy-transition',
					title:__('Copy Selected Keyframe', 'wpgraphicator')
				},{
					name:'paste-transition',
					title:__('Paste Keyframe', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'default-easing',
					title:__('Default Easing', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'clear-animation',
					title:__('Clear Animation', 'wpgraphicator')
				}]
			},{
				name:'view',
				title:__('View', 'wpgraphicator'),
				items:[{
					name:'grid-size',
					title:__('Grid Size', 'wpgraphicator')
				},{
					name:'snap-to-grid',
					title:snapToGrid ? __('Turn Off Snap to Grid', 'wpgraphicator') : __('Snap to Grid', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'fit-canvas',
					title:__('Fit Canvas', 'wpgraphicator')
				}]
			},{
				name:'help',
				title:__('Help', 'wpgraphicator'),
				items:[{
					name:'keyboard-shortcuts',
					title:__('Keyboard Shortcuts', 'wpgraphicator')
				},{
					name:'shortcode-generator',
					title:__('Shortcode Generator', 'wpgraphicator')
				}]
			}],
			keyboardShortcuts,
			easings,
			getSvgPreview:this._getSvgPreview.bind(this),
			getShortcode:this._getShortcode.bind(this),
			playingModes:playing_modes,
			preserveAspectRatioValues:preserve_aspect_ratio_values
		};
	},

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-topbar-menu__item-button':'_openDropdown',
		'click .wpg-popup__backdrop':'_closeDopdown',
		'click .wpg-topbar-menu__dropdown-item-button':'_doAction',
		'change .wpg-topbar-menu__modal-grid-size-input':'_setGridSize',
		'change .wpg-topbar-menu__modal-default-easing-select':'_setDefaultEasing',
		'click .wpg-shortcode-generator__copy-button':'_copyShortcodeToClipboard',
		'change .wpg-shortcode-generator__settings .wpg-input':'_setShortcode',
		'change .wpg-shortcode-generator__settings .wpg-select':'_setShortcode'
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.state, 'change:shortcodeParams', this._setShortcodeAndSVG);
		this.$document.on('keydown', this._onDocumentKeydown.bind(this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		this._createPreviewConfig();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_openDropdown(e){
		e.preventDefault();
		const item = $(e.target).data('item');
		this.setState('topbarMenuActiveDropdown', item);
		this.$('.wpg-topbar-menu__dropdown-item-button').first().trigger('focus');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_closeDopdown(e){
		e?.preventDefault();
		this.setState('topbarMenuActiveDropdown', '');
		this.setState('topbarMenuShowModal', '');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_doAction(e){
		e.preventDefault();
		this._closeDopdown();
		const action = $(e.target).data('action');
		const shape = this.scene.getActiveObject();
		const shapeModel = this.shapes.get(shape?.id);
		const activeTrackPoints = this.getState('activeTrackPoints');
		switch (action){
			// Edit menu.
			case 'undo':
			this.history.undo();
			break;
			case 'delete-shape':
			if (shape){
				this.sendNotice(
					removeShape,
					'warning',
					() => {
						this.scene.remove(shape);
						this.setState('totalDuration', this.anime.duration / 1000);
					},
					true
				);
			}
			break;
			case 'copy-shape':
			if (shape){
				this.clipboard.copy(shape, 'shape');
				this.clipboard.__shapeTop = shape.top;
				this.clipboard.__shapeLeft = shape.left;
			}
			break;
			case 'paste-shape':
			this.clipboard.paste(object => {
				object.clone(newObject => {
					this.clipboard.__shapeTop += 5;
					this.clipboard.__shapeLeft += 5;
					newObject.set({
						top:this.clipboard.__shapeTop,
						left:this.clipboard.__shapeLeft
					});
					this.scene
					.discardActiveObject()
					.add(newObject)
					.setActiveObject(newObject);
				});
			}, 'shape');
			break;
			case 'clear-canvas':
			if (this.scene._objects.length){
				this.sendNotice(
					removeAllShapes,
					'warning',
					() => this.scene.forEachObject(shape => this.scene.remove(shape), this),
					true
				);
			}
			break;
			// Animation menu.
			case 'delete-transition':
			if (activeTrackPoints && activeTrackPoints.length){
				this.sendNotice(
					removePoint,
					'warning',
					() => {
						const pointView = activeTrackPoints[0];
						pointView?.model.collection.remove(pointView?.model);
					},
					true
				);
			}
			break;
			case 'copy-transition':
			if (activeTrackPoints && activeTrackPoints.length && activeTrackPoints[0].model){
				this.clipboard.copy(activeTrackPoints[0].model, 'transition')
			}
			break;
			case 'paste-transition':
			this.clipboard.paste(model => {
				if (!shapeModel){
					return;
				}
				const transitionModel = model.clone();
				const property = model.get('property');
				const shapeId = shapeModel.get('id');
				const propModel = shapeModel._properties.get(property) || shapeModel._properties.add({
					id:property,
					shapeId
				});
				transitionModel.set({
					shapeId,
					second:this.getState('currentTime')
				});
				propModel._transitions.add(transitionModel);
			}, 'transition');
			break;
			case 'default-easing':
			this.setState('topbarMenuShowModal', 'default-easing');
			this.$('.wpg-topbar-menu__modal-default-easing-select').trigger('focus');
			break;
			case 'clear-animation':
			if (shapeModel && shapeModel._properties.length){
				this.sendNotice(
					removeAllPoints,
					'warning',
					() => {
						shapeModel._properties.set([]);
					},
					true
				);
			}
			break;
			// View menu.
			case 'grid-size':
			this.setState('topbarMenuShowModal', 'grid-size');
			this.$('.wpg-topbar-menu__modal-grid-size-input').trigger('focus');
			break;
			case 'snap-to-grid':
			this.setState('snapToGrid', !this.getState('snapToGrid'));
			break;
			case 'fit-canvas':
			this._fitSceneToScreen();
			this._setProjectBackground();
			break;
			// Help menu.
			case 'keyboard-shortcuts':
			this.setState('topbarMenuShowModal', 'keyboard-shortcuts');
			break;
			case 'shortcode-generator':
			this.setState('topbarMenuShowModal', 'shortcode-generator');
			break;
			default:
			break;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setGridSize(e){
		const value = $(e.target).val();
		this.setState('gridSize', parseInt(value) || 0);
		this._closeDopdown();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setDefaultEasing(e){
		const value = $(e.target).val();
		this.setState('defaultEasing', value);
		this._closeDopdown();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_copyShortcodeToClipboard(e){
		e.preventDefault();
		const input = this.$('.wpg-shortcode-generator__shortcode-input');
		input.trigger('select');
		input[0].setSelectionRange(0, 200);
		this.$document[0].execCommand('copy');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setShortcode(e){
		const target = $(e.target);
		const param = target.data('param');
		const value = target.val();
		if (!param){
			return;
		}
		const params = omit(this.getState('shortcodeParams'), param);
		if (value){
			params[param] = value;
		}
		this.setState('shortcodeParams', params);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onDocumentKeydown(e){
		switch (e.keyCode){
			case 71: // G
			if (e.ctrlKey || e.metaKey){
				e.preventDefault();
				this.setState('snapToGrid', !this.getState('snapToGrid'));
			}
			break;
			case 67: // C
			if (e.altKey && e.shiftKey && this.scene._objects.length){
				this.sendNotice(
					removeAllShapes,
					'warning',
					() => this.scene.forEachObject(shape => this.scene.remove(shape), this),
					true
				);
			}
			break;
			default:
			break;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_setShortcodeAndSVG(){
		this.$('.wpg-shortcode-generator__shortcode .wpg-input').val(this._getShortcode());
		this.$('.wpg-shortcode-generator__svg-preview').html(this._getSvgPreview());
		this._createPreviewConfig();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_createPreviewConfig(){
		if (!window.wpGraphicator){
			return;
		}
		const projectID = this.getState('projectID');
		const prevUniqueId = this._svgUniqueId - 1;
		window.wpGraphicator.timelines[`tl_${projectID}_${prevUniqueId}`]?.pause();
		if (this.getState('topbarMenuShowModal') !== 'shortcode-generator'){
			return;
		}
		const transitions = this.shapes.toJSON();
		const options = clone(this.getState('shortcodeParams'));
		options.id = `${projectID}_${this._svgUniqueId}`;
		setTimeout(() => {
			window.wpGraphicator.config(transitions, options);
		}, 400);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {string}
	 */

	_getSvgPreview(){
		if (this.getState('topbarMenuShowModal') !== 'shortcode-generator'){
			return '';
		}
		const params = this.getState('shortcodeParams');
		const id = this.getState('projectID');
		const attrs = [
			'xmlns="http://www.w3.org/2000/svg"',
			`id="wpgraphicator_${id}_${++this._svgUniqueId}"`,
			params.width ? `width="${params.width}"` : '',
			params.height ? `height="${params.height}"` : '',
			params.preserveaspectratio ? `preserveAspectRatio="${params.preserveaspectratio}"` : '',
		];
		const svg = this._getProjectSvg().replace('xmlns="http://www.w3.org/2000/svg"', attrs.join(' '));
		return svg;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {string}
	 */

	_getShortcode(){
		const id = this.getState('projectID');
		const params = reduce(this.getState('shortcodeParams'), (res, val, key) => {
			val = `${val}`.indexOf(' ') >= 0 ? `'${val}'` : val;
			res += ` ${key}=${val}`;
			return res;
		}, '');
		return `[wpgraphicator id=${id}${params}]`;
	},

	/**
	 *
	 * @since 1.0.0
	 */

	_fitSceneToScreen:Project.prototype._fitSceneToScreen,

	/**
	 *
	 * @since 1.0.0
	 */

	_setProjectBackground:Project.prototype._setProjectBackground,

	/**
	 *
	 * @since 1.0.0
	 */

	_getProjectSvg:TopbarSave.prototype._getProjectSvg

});
