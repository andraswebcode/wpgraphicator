import $ from 'jquery';
import {
	Group,
	IText,
	loadSVGFromString
} from 'fabric';
import {
	reduce,
	clone,
	omit,
	each,
	findWhere,
	without,
	min,
	uniq,
	isArray,
	uniqueId
} from 'underscore';
import {
	i18n,
	api
} from 'wordpress';
import {
	url,
	version,
	playing_modes,
	preserve_aspect_ratio_values,
	def_filename
} from 'wpgeditor';

import Subview from './subview.js';
import Project from './frame-project.js';
import TopbarSave from './subview-topbar-save.js';
import {
	notificationMessages,
	easings,
	countShapesInSVGString
} from './../utils/utils.js';
import {
	getSVGStringWithCSSAnimation,
	getSVGStringWithSMILAnimation
} from './../utils/animation-exporter.js';
import {
	keyboardShortcuts
} from './../utils/keyboard-shortcuts.js';
import {
	MAX_SVG_FILE_SIZE,
	MAX_SVG_NUM_OF_SHAPES
} from './../utils/constants.js';

const {
	__,
	_n,
	sprintf
} = i18n;
const {
	Wpgraphicator
} = api.models;
const {
	new_project
} = url;
const {
	removeShape,
	removeAllShapes,
	removePoint,
	removeAllPoints,
	groupShapes,
	ungroupShapes
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
	 *
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
		const shape = this.scene.getActiveObject();
		const group = (shape?.type === 'group');
		const hasntSelectedKeyframe = () => {
			const views = this.getState('activeTrackPoints') || [];
			return !(views.length && views[0]);
		};
		return {
			menuItems:[{
				name:'file',
				title:__('File', 'wpgraphicator'),
				items:[{
					name:'new-project',
					title:__('New', 'wpgraphicator')
				},{
					name:'save-as',
					title:__('Save as', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'export-json',
					title:__('Export as JSON', 'wpgraphicator')
				},{
					name:'export-svg',
					title:__('Export SVG', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'import-svg',
					title:__('Import SVG', 'wpgraphicator')
				}]
			},{
				name:'edit',
				title:__('Edit', 'wpgraphicator'),
				items:[{
					name:'undo',
					title:__('Undo', 'wpgraphicator'),
					disabled:() => this.history.index < 0
				},{
					name:'divider'
				},{
					name:'delete-shape',
					title:__('Delete Selected Shape', 'wpgraphicator'),
					disabled:() => !shape
				},{
					name:'copy-shape',
					title:__('Copy Selected Shape', 'wpgraphicator'),
					disabled:() => !shape
				},{
					name:'paste-shape',
					title:__('Paste Shape', 'wpgraphicator'),
					disabled:() => !(this.clipboard._object && this.clipboard._type === 'shape')
				},{
					name:'divider'
				},{
					name:'group-shapes',
					title:group ? __('Ungroup Shapes', 'wpgraphicator') : __('Group Selected Shapes', 'wpgraphicator'),
					disabled:() => !(shape?.type === 'activeSelection' || shape?.type === 'group')
				},{
					name:'divider'
				},{
					name:'clear-canvas',
					title:__('Clear Canvas', 'wpgraphicator'),
					disabled:() => !this.scene._objects.length
				}]
			},{
				name:'animation',
				title:__('Animation', 'wpgraphicator'),
				items:[{
					name:'delete-transition',
					title:__('Delete Selected Keyframe', 'wpgraphicator'),
					disabled:hasntSelectedKeyframe
				},{
					name:'copy-transition',
					title:__('Copy Selected Keyframe', 'wpgraphicator'),
					disabled:hasntSelectedKeyframe
				},{
					name:'paste-transition',
					title:__('Paste Keyframe', 'wpgraphicator'),
					disabled:() => !(this.clipboard._object && this.clipboard._type === 'transition')
				},{
					name:'divider'
				},{
					name:'default-easing',
					title:__('Default Easing', 'wpgraphicator')
				},{
					name:'divider'
				},{
					name:'clear-animation',
					title:__('Clear Animation', 'wpgraphicator'),
					disabled:() => {
						const shapeModel = this.shapes.get(shape?.id);
						return !(shapeModel?._properties?.at(0)?._transitions.length);
					}
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
		'click .wpg-topbar-menu__modal-save-as-button':'_saveProjectAs',
		'click .wpg-topbar-menu__modal-export-svg-download-button':'_exportAndDownloadSVG',
		'click .wpg-topbar-menu__modal-svg-import-file-button':'_importSVGFile',
		'click .wpg-topbar-menu__modal-svg-import-ok-button':'_parseSVGFile',
		'click .wpg-topbar-menu__modal-svg-import-cancel-button':'_closeDopdown',
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
			// File menu.
			case 'new-project':
			this.$window[0].location = new_project;
			break;
			case 'save-as':
			this.setState('topbarMenuShowModal', 'save-as');
			break;
			case 'export-json':
			if (!this.__exportJSONElement){
				this.__exportJSONElement = $('<a></a>').appendTo('body');
			}
			const title = this.getState('projectName');
			const svg = this._getProjectSvg();
			const json = {
				__file:'wpgraphicator',
				title,
				svg:svg.replace(/\n|\t/g, ''),
				project:{
					width:this.getState('projectWidth'),
					height:this.getState('projectHeight'),
					seconds:this.getState('seconds'),
					background:this.getState('projectBackground'),
					version
				},
				transitions:this.shapes.toJSON()
			};
			const link = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json));
			const fileName = title ? title.toLowerCase().replace(/\s/g, '-') + '.json' : def_filename + '.json';
			this.__exportJSONElement.attr({
				href:link,
				download:fileName
			});
			this.__exportJSONElement[0].click();
			break;
			case 'export-svg':
			this.setState('topbarMenuShowModal', 'export-svg');
			break;
			case 'import-svg':
			this.setState('topbarMenuShowModal', 'import-svg');
			break;
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
						if (shape.type === 'activeSelection'){
							const models = shape._objects.map(({id}) => this.shapes.get(id));
							each(shape._objects, object => this.scene.remove(object));
							this.scene.discardActiveObject();
							this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:remove', shape._objects);
						} else {
							this.scene.remove(shape);
						}
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
				this.clipboard.__shapeTop += 5;
				this.clipboard.__shapeLeft += 5;
				if (object.type === 'activeSelection'){
					this.scene.discardActiveObject();
					const shapes = [];
					const models = [];
					each(object._objects, obj => {
						obj.clone(o => {
							o.set({
								top:this.clipboard.__shapeTop + (o.top - object.top),
								left:this.clipboard.__shapeLeft + (o.left - object.left)
							});
							this.scene.add(o);
							shapes.push(o);
							models.push(this.shapes.get(o.id));
						});
					});
					this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:add', shapes);
				} else {
					object.clone(newObject => {
						newObject.set({
							top:this.clipboard.__shapeTop,
							left:this.clipboard.__shapeLeft
						});
						this.scene
						.discardActiveObject()
						.add(newObject)
						.setActiveObject(newObject);
					});
				}
			}, 'shape');
			break;
			case 'group-shapes':
			this.__groupUngroupShapes();
			break;
			case 'clear-canvas':
			if (this.scene._objects.length){
				this.sendNotice(
					removeAllShapes,
					'warning',
					() => {
						const shapes = [];
						const models = [];
						this.shapes.each(model => models.push(model));
						this.scene.forEachObject(shape => {
							shapes.push(shape);
							this.scene.remove(shape);
						}, this);
						this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:remove', shapes);
					},
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
						each(activeTrackPoints, point => {
							point.model?.collection.remove(point.model);
						});
					},
					true
				);
			}
			break;
			case 'copy-transition':
			if (activeTrackPoints && activeTrackPoints.length && activeTrackPoints[0].model){
				if (activeTrackPoints.length === 1){
					this.clipboard.copy(activeTrackPoints[0].model, 'transition');
				} else {
					this.clipboard.copy(activeTrackPoints.map(point => point.model), 'transition');
				}
			}
			break;
			case 'paste-transition':
			this.clipboard.paste(model => {
				const currentTime = this.getState('currentTime');
				if (isArray(model)){ // In case of multiple points.
					const shapeIds = uniq(model.map(m => m.get('shapeId')));
					const selectedShapes = this.getState('selectedShapeIds') || [];
					const minSec = min(model, m => m.get('second'))?.get('second');
					each(model, model => {
						const transitionModel = model.clone();
						const property = model.get('property');
						const second = model.get('second');
						const shapeId = (shapeIds.length === 1 && selectedShapes.length === 1) ? selectedShapes[0] : model.get('shapeId');
						const shapeModel = this.shapes.get(shapeId);
						const propModel = shapeModel._properties.get(property) || shapeModel._properties.add({
							id:property,
							shapeId
						});
						transitionModel.set({
							shapeId,
							second:second - minSec + currentTime
						});
						propModel._transitions.add(transitionModel);
					});
				} else { // In case of a single point.
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
						second:currentTime
					});
					propModel._transitions.add(transitionModel);
				}
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
	 * @since 1.1.0
	 * @access private
	 * @param {object} e Event.
	 */

	_saveProjectAs(e){

		e.preventDefault();
		const newProject = new Wpgraphicator();
		const svg = this._getProjectSvg();
		const title = this.$('.wpg-topbar-menu__modal-save-as-input').val();
		this.shapes.each((shape, i) => shape.set('zIndex', i));

		newProject.save({
			title,
			content:svg,
			status:'publish',
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
				const id = newProject.id || '';
				this.$window[0].location = new_project + '&id=' + id;
			},
			error:() => {}
		});

	},

	/**
	 *
	 * @since 1.3.0
	 * @access private
	 * @param {object} e Event.
	 */

	_exportAndDownloadSVG(e){

		e.preventDefault();

		const svgString = this._getProjectSvg();
		const animation = this.shapes.toJSON();
		const type = this.$('.wpg-topbar-menu__modal-export-svg-anim-type-select').val();
		const fileName = this.$('.wpg-topbar-menu__modal-export-svg-file-name-input').val();
		const repeat = this.$('.wpg-topbar-menu__modal-export-svg-repeat-select').val() || 1;
		const preserveAspectRatio = this.$('.wpg-topbar-menu__modal-export-svg-par-select').val();
		const totalDuration = this.getState('totalDuration');
		const defFileName = (this.getState('projectName') || '').replace(/\s/g, '-').toLowerCase();
		let link = 'data:image/svg+xml;charset=utf-8,';

		if (type === 'smil'){
			link += encodeURIComponent(getSVGStringWithSMILAnimation(svgString, animation, {
				repeat,
				preserveAspectRatio,
				totalDuration,
				version
			}));
		} else {
			link += encodeURIComponent(getSVGStringWithCSSAnimation(svgString, animation, {
				repeat,
				preserveAspectRatio,
				totalDuration,
				version
			}));
		}

		if (!this.__anchorElement){
			this.__anchorElement = $('<a></a>').appendTo('body');
		}

		this.__anchorElement.attr({
			href:link,
			download:(fileName || defFileName || def_filename) + '.svg'
		});
		this.__anchorElement[0].click();

	},

	/**
	 *
	 * @since 1.1.0
	 * @access private
	 * @param {object} e Event.
	 */

	_importSVGFile(e){
		e.preventDefault();
		this.__svgFileInput = $('<input>', {
			type:'file',
			accept:'image/svg+xml'
		});
		const reader = new FileReader();
		reader.onload = e => {
			const numOfShapes = countShapesInSVGString(reader.result);
			this.__importedSVGString = reader.result;
			this.$('.wpg-topbar-menu__modal-svg-import-num-of-layers').html(
				'&nbsp;&mdash;&nbsp;' +
				sprintf(
					_n('%s layer', '%s layers', numOfShapes, 'wpgraphicator'),
					numOfShapes
				)
			);
			this.$('.wpg-topbar-menu__modal-svg-import-preview').find('svg').remove();
			this.$('.wpg-topbar-menu__modal-svg-import-preview').append(reader.result);
			this.$('.wpg-topbar-menu__modal-svg-import-button-wrapper').show();
			if (numOfShapes > MAX_SVG_NUM_OF_SHAPES){
				this.$('.wpg-topbar-menu__modal-svg-import-message').show().text(
					sprintf(
						__('Note: This SVG contains %s layers that are more than the recommended maximum: %s. The process might take a long time.', 'wpgraphicator'),
						numOfShapes,
						MAX_SVG_NUM_OF_SHAPES
					)
				);
			}
		};
		reader.onerror = () => {};
		this.__svgFileInput.on('change', e => {
			const input = this.__svgFileInput[0];
			const file = (input.files && input.files[0]);
			if (file && file.type === 'image/svg+xml'){
				if (file.size < MAX_SVG_FILE_SIZE){
					this.$('.wpg-topbar-menu__modal-svg-import-message').hide().text('');
					this.$('.wpg-topbar-menu__modal-svg-import-file-name').text(input.files[0].name);
					reader.readAsText(input.files[0]);
				} else {
					this.$('.wpg-topbar-menu__modal-svg-import-message').show().text(
						sprintf(
							__('SVG file is too large. The maximum upload file size is %sMB.', 'wpgraphicator'),
							MAX_SVG_FILE_SIZE / 1000000
						)
					);
					this.$('.wpg-topbar-menu__modal-svg-import-preview').find('svg').remove();
					this.$('.wpg-topbar-menu__modal-svg-import-button-wrapper').hide();
				}
			} else {
				this.$('.wpg-topbar-menu__modal-svg-import-message').show().text(
					__('Please choose an SVG file.', 'wpgraphicator')
				);
				this.$('.wpg-topbar-menu__modal-svg-import-preview').find('svg').remove();
				this.$('.wpg-topbar-menu__modal-svg-import-button-wrapper').hide();
			}
		});
		this.__svgFileInput[0].click();
	},

	/**
	 *
	 * @since 1.1.0
	 * @access private
	 * @param {object} e Event.
	 */

	_parseSVGFile(e){

		e.preventDefault();

		if (!this.__importedSVGString){
			this.sendNotice(
				__('SVG string is missing.', 'wpgraphicator'),
				'error'
			);
			this._closeDopdown();
			return;
		}

		this.$('.wpg-topbar-menu__modal-svg-import-loader').css('display', 'flex');
		$('.wpg-topbar__loader').show();

		const resetCanvas = this.$('.wpg-topbar-menu__modal-svg-import-reset-canvas')[0].checked;
		const groupLayers = this.$('.wpg-topbar-menu__modal-svg-import-group-layers')[0].checked;
		const strokeWidth = fabric.Object.prototype.strokeWidth;
		const fill = fabric.Object.prototype.fill;

		// Reset SVG defaults.
		fabric.Object.prototype.strokeWidth = 0;
		fabric.Object.prototype.fill = '#000000';
		setTimeout(() => {
			try {
				loadSVGFromString(this.__importedSVGString, (shapes, options, elements, allElements) => {
					if (resetCanvas){
						this.scene.forEachObject(shape => this.scene.remove(shape), this);
						this.setState({
							projectWidth:options.width,
							projectHeight:options.height
						});
					}
					if (groupLayers){
						console.time('SVG Loaded');
						const group = new Group(shapes);
						this.scene.add(group);
						console.timeEnd('SVG Loaded');
					} else {
						const _shapes = {};
						const _shapesToHistory = [];
						console.time('SVG Loaded');
						each(allElements, el => {
							$(el).data('svgid', uniqueId('svgid__'));
						});
						each(shapes, (shape, i) => {
							let elem = $(elements[i]);
							// Replace text to i-text to be editable.
							if (shape.type === 'text'){
								const text = shape.text;
								const options = omit(shape.toObject(), 'type');
								shape = new IText(text, options);
							}
							// Find the first group ancessor.
							while (elem.parent().prop('tagName') === 'g'){
								elem = elem.parent();
							}
							if (elem.prop('tagName') === 'g'){
								if (!_shapes[elem.data('svgid')]){
									_shapes[elem.data('svgid')] = [];
								}
								_shapes[elem.data('svgid')].push(shape);
							} else {
								_shapes[elem.data('svgid')] = shape;
							}
						});
						each(_shapes, shape => {
							if (isArray(shape)){ // In case of group.
								const group = shape.length === 1 ? shape[0] : new Group(shape);
								this.scene.add(group);
								_shapesToHistory.push(group);
							} else { // In case of a single shape.
								this.scene.add(shape);
								_shapesToHistory.push(shape);
							}
						});
						console.timeEnd('SVG Loaded');
						const models = _shapesToHistory.map(({id}) => this.shapes.get(id));
						this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:add', _shapesToHistory);
					}
					this._closeDopdown();
					$('.wpg-topbar__loader').hide();
				});
			} catch (e){
				console.error(e);
				fabric.Object.prototype.strokeWidth = strokeWidth;
				fabric.Object.prototype.fill = fill;
				this._closeDopdown();
				$('.wpg-topbar__loader').hide();
				this.sendNotice(
					__('Something went wrong while parsing svg.', 'wpgraphicator'),
					'error'
				);
			}
		}, 40);
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
			} else if (e.altKey && e.shiftKey){
				this.__groupUngroupShapes();
			}
			break;
			case 67: // C
			if (e.altKey && e.shiftKey && this.scene._objects.length){
				this.sendNotice(
					removeAllShapes,
					'warning',
					() => {
						const shapes = [];
						const models = [];
						this.shapes.each(model => models.push(model));
						this.scene.forEachObject(shape => {
							shapes.push(shape);
							this.scene.remove(shape);
						}, this);
						this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:remove', shapes);
					},
					true
				);
			}
			break;
			case 70: // F
			if (e.ctrlKey || e.metaKey){
				e.preventDefault();
				this._fitSceneToScreen();
				this._setProjectBackground();
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
	 * @since 1.2.0
	 * @access private
	 */

	__groupUngroupShapes(){
		const shape = this.scene.getActiveObject();
		if (shape?.type === 'activeSelection'){
			this.sendNotice(
				groupShapes,
				'warning',
				() => {
					const existingGroup = findWhere(shape._objects, {
						type:'group'
					});
					let group = null;
					if (existingGroup){
						group = new Group([]);
						this.scene.add(group);
						// const restObjects = without(shape._objects, existingGroup);
						const fromShapes = shape._objects.slice();
						const fromModels = fromShapes.map(o => this.shapes.get(o.id));
						this.scene.discardActiveObject();
						each(shape._objects, obj => {
							if (obj?.type === 'group'){
								const objs = obj._objects.slice();
								obj.toActiveSelection();
								this.scene.discardActiveObject();
								each(objs, o => {
									this.scene.remove(o);
									group.addWithUpdate(o);
								});
								// obj.toActiveSelection() removes _objects array.
								// @see fabric.Group.prototype.toActiveSelection()
								obj._objects = objs;
							} else {
								this.scene.remove(obj);
								group.addWithUpdate(obj);
							}
						});
						this.scene.setActiveObject(group);
						this.shapes.trigger('wpg:pushtohistorystack', {
							from:fromModels,
							to:this.shapes.get(group.id)
						}, 'replace', {
							from:fromShapes,
							to:group
						});
					} else {
						const fromShapes = shape._objects.slice();
						const fromModels = fromShapes.map(o => this.shapes.get(o.id));
						const index = min(shape._objects, 'zIndex')?.zIndex;
						group = shape.toGroup();
						while (group.zIndex > index){
							if (this.shapes.get(group.id)?.moveBackward()){
								group.sendBackwards();
							}
						}
						this.scene
						.discardActiveObject()
						.setActiveObject(group);
						this.shapes.trigger('wpg:pushtohistorystack', {
							from:fromModels,
							to:this.shapes.get(group.id)
						}, 'replace', {
							from:fromShapes,
							to:group
						});
					}
				},
				true
			);
		} else if (shape?.type === 'group'){
			this.sendNotice(
				ungroupShapes,
				'warning',
				() => {
					$('.wpg-topbar__loader').show();
					setTimeout(() => {
						const fromModel = this.shapes.get(shape.id);
						const toShapes = shape._objects.slice();
						const index = shape.zIndex;
						const activeSelection = shape.toActiveSelection();
						each(activeSelection._objects, (object, i) => {
							while (object.zIndex > index + i){
								this.shapes.get(object.id)?.moveBackward();
							}
							object.moveTo(index + i);
						});
						this.scene
						.discardActiveObject()
						.setActiveObject(activeSelection);
						const toModels = toShapes.map(o => this.shapes.get(o.id));
						shape._objects = toShapes.slice();
						this.shapes.trigger('wpg:pushtohistorystack', {
							from:fromModel,
							to:toModels
						}, 'replace', {
							from:shape,
							to:toShapes
						});
						$('.wpg-topbar__loader').hide();
					}, 40);
				},
				true
			);
		}
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
