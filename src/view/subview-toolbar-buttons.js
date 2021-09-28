import $ from 'jquery';
import {
	PencilBrush,
	Point,
	Image as FabricImage
} from 'fabric';
import {
	i18n,
	media
} from 'wordpress';
import {
	debounce
} from 'underscore';
import {
	createPopperLite,
	preventOverflow,
	flip
} from '@popperjs/core';

import Subview from './subview.js';
import SquareBrush from './../canvas/class-brush-square.js';
import EllipseBrush from './../canvas/class-brush-ellipse.js';
import LineBrush from './../canvas/class-brush-line.js';
import GeometryBrush from './../canvas/class-brush-geometry.js';
import {
	shapeLibrary
} from './../utils/shape-library.js';
import {
	COLOR_PICKER_WIDTH
} from './../utils/constants.js';

const {
	__
} = i18n;

/**
 * Toolbar buttons subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends ToolbarButtons.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'toolbar-buttons',

	/**
	 * The view's html tag name.
	 * @since 1.0.0
	 * @var {string}
	 */

	tagName:'ul',

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		return {
			buttons:[{
				name:'select-mode',
				title:__('Select Mode', 'wpgraphicator'),
				icon:'fas fa-mouse-pointer'
			},{
				name:'free-draw',
				title:__('Free Draw', 'wpgraphicator'),
				icon:'fas fa-pen'
			},{
				name:'draw-square',
				title:__('Draw Square', 'wpgraphicator'),
				icon:'fas fa-square'
			},{
				name:'draw-ellipse',
				title:__('Draw Ellipse', 'wpgraphicator'),
				icon:'fas fa-circle'
			},{
				name:'add-text',
				title:__('Add Text', 'wpgraphicator'),
				icon:'fas fa-font'
			},{
				name:'draw-path',
				title:__('Draw Path', 'wpgraphicator'),
				icon:'fas fa-pen-nib'
			},{
				name:'draw-polyline',
				title:__('Draw Polyline', 'wpgraphicator'),
				icon:'fas fa-draw-polygon'
			},{
				name:'edit-path',
				title:__('Edit Path', 'wpgraphicator'),
				icon:'fas fa-bezier-curve'
			},{
				name:'draw-shape',
				title:__('Draw Shape', 'wpgraphicator'),
				icon:'fas fa-star'
			},{
				name:'add-image',
				title:__('Add Image', 'wpgraphicator'),
				icon:'fas fa-image'
			},{
				name:'stroke-color',
				title:__('Active Stroke Color', 'wpgraphicator'),
				icon:'fas fa-tint'
			},{
				name:'fill-color',
				title:__('Active Fill Color', 'wpgraphicator'),
				icon:'fas fa-fill-drip'
			},{
				name:'stroke-width',
				title:__('Active Stroke Width', 'wpgraphicator'),
				icon:'fas fa-minus'
			},{
				name:'zoom-in',
				title:__('Zoom In', 'wpgraphicator'),
				icon:'fas fa-search-plus'
			},{
				name:'zoom-out',
				title:__('Zoom Out', 'wpgraphicator'),
				icon:'fas fa-search-minus'
			}],
			shapeLibrary,
			getDisabled:this._getDisabled.bind(this),
			needsColorPopup:this._needsColorPopup.bind(this),
			needsSliderPopup:this._needsSliderPopup.bind(this),
			needsShapesPopup:this._needsShapesPopup.bind(this)
		};
	},

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-toolbar-button > .wpg-button':'_setActiveTool',
		'click .wpg-popup__backdrop':'_onClickBackdrop',
		'click .wpg-toolbar-button__shape-library-item > .wpg-button':'_setShapeGeometry'
	},

	/**
	 * Constructor
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.__prevActiveTool = this.getState('activeTool');
		this.listenTo(this.state, 'change:activeTool', this._doActiveTool);
		this.listenTo(this.state, 'change:activeTool change:snapToGrid change:gridSize', this._brushSnapToGrid);
		this.$document.on('keydown', this._onDocumentKeyDown.bind(this));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		const activeTool = this.getState('activeTool');
		if (activeTool === 'stroke-color'){
			const button = this.$('.wpg-toolbar-button__stroke-color').find('.wpg-button');
			const popup = this.$('.wpg-toolbar-button__stroke-color').find('.wpg-popup');
			const picker = this.$('.wpg-toolbar-button__stroke-color').find('.wpg-color-picker');
			createPopperLite(button[0], popup[0], {
				placement:'right',
				modifiers:[preventOverflow, flip]
			});
			picker.colorPicker({
				width:COLOR_PICKER_WIDTH,
				change:debounce((e, {color}) => this.setState('activeStrokeColor', color.toString()), 400)
			});
			setTimeout(() => picker.trigger('focus'), 20);
		} else if (activeTool === 'fill-color'){
			const button = this.$('.wpg-toolbar-button__fill-color').find('.wpg-button');
			const popup = this.$('.wpg-toolbar-button__fill-color').find('.wpg-popup');
			const picker = this.$('.wpg-toolbar-button__fill-color').find('.wpg-color-picker');
			createPopperLite(button[0], popup[0], {
				placement:'right',
				modifiers:[preventOverflow, flip]
			});
			picker.colorPicker({
				width:COLOR_PICKER_WIDTH,
				change:debounce((e, {color}) => this.setState('activeFillColor', color.toString()), 400)
			});
			setTimeout(() => picker.trigger('focus'), 20);
		} else if (activeTool === 'stroke-width'){
			const button = this.$('.wpg-toolbar-button__stroke-width').find('.wpg-button');
			const popup = this.$('.wpg-toolbar-button__stroke-width').find('.wpg-popup');
			const slider = this.$('.wpg-toolbar-button__stroke-width').find('.wpg-range-slider');
			createPopperLite(button[0], popup[0], {
				placement:'right',
				modifiers:[preventOverflow, flip]
			});
			slider.rangeSlider({
				value:this.getState('activeStrokeWidth'),
				change:(e, {value}) => this.setState('activeStrokeWidth', value)
			});
			setTimeout(() => slider.find('.ui-slider-handle').trigger('focus'), 20);
		} else if (activeTool === 'draw-shape' && this.__needsShapesPopup){
			const button = this.$('.wpg-toolbar-button__draw-shape').find('.wpg-button');
			const popup = this.$('.wpg-toolbar-button__draw-shape').find('.wpg-popup');
			createPopperLite(button[0], popup[0], {
				placement:'right',
				modifiers:[preventOverflow, flip]
			});
			setTimeout(() => this.$('.wpg-toolbar-button__shape-library-item').first().find('.wpg-button').trigger('focus'), 20);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setActiveTool(e){
		e.preventDefault();
		e.stopPropagation();
		const activeTool = $(e.currentTarget).data('name');
		if (activeTool === 'draw-shape'){
			this.__needsShapesPopup = true;
			if (activeTool === this.getState('activeTool')){
				this.render();
				return;
			}
		}
		this.setState('activeTool', activeTool);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_brushSnapToGrid(){
		const brush = this.scene.freeDrawingBrush;
		if (brush){
			brush.gridSize = this.getState('snapToGrid') ? this.getState('gridSize') : 0;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_onClickBackdrop(){
		this.setState('activeTool', this.__prevActiveTool);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {string} activeTool
	 */

	_doActiveTool(state, activeTool){
		const scene = this.scene;
		scene.isDrawingMode = false;
		scene.forEachObject(shape => {
			shape.selectable = true;
		});
		scene.selection = false;
		scene.defaultCursor = scene.constructor.prototype.defaultCursor;
		scene.moveCursor = scene.constructor.prototype.moveCursor;
		scene.hoverCursor = scene.constructor.prototype.hoverCursor;
		switch (activeTool){
			case 'select-mode':
			scene.selection = true;
			scene.isDrawingMode = false;
			this._createPathControls(true);
			break;
			case 'free-draw':
			scene.isDrawingMode = true;
			scene.freeDrawingBrush = new PencilBrush(scene);
			scene.freeDrawingBrush.color = this.getState('activeStrokeColor');
			scene.freeDrawingBrush.width = this.getState('activeStrokeWidth');
			break;
			case 'draw-square':
			scene.isDrawingMode = true;
			scene.freeDrawingBrush = new SquareBrush(scene);
			scene.freeDrawingBrush.color = this.getState('activeStrokeColor');
			scene.freeDrawingBrush.width = this.getState('activeStrokeWidth');
			scene.freeDrawingBrush.fill = this.getState('activeFillColor');
			break;
			case 'draw-ellipse':
			scene.isDrawingMode = true;
			scene.freeDrawingBrush = new EllipseBrush(scene);
			scene.freeDrawingBrush.color = this.getState('activeStrokeColor');
			scene.freeDrawingBrush.width = this.getState('activeStrokeWidth');
			scene.freeDrawingBrush.fill = this.getState('activeFillColor');
			break;
			case 'add-text':
			scene.forEachObject(shape => {
				shape.selectable = false;
			});
			scene.discardActiveObject().requestRenderAll();
			scene.defaultCursor = 'text';
			scene.moveCursor = 'text';
			scene.hoverCursor = 'text';
			// Do more things in Project frame.
			// @see Project.prototype._onSceneMouseMoveInAddTextMode
			// @see Project.prototype._onSceneMouseUpInAddTextMode
			break;
			case 'draw-path':
			case 'draw-polyline':
			scene.forEachObject(shape => {
				shape.selectable = false;
			});
			scene.discardActiveObject().requestRenderAll();
			scene.moveCursor = 'default';
			scene.hoverCursor = 'default';
			// Do other things in Project frame.
			// @see Project.prototype._onSceneMouseDownInPathDrawingMode
			// @see Project.prototype._onSceneMouseMoveInPathDrawingMode
			// @see Project.prototype._onSceneMouseUpInPathDrawingMode
			// @see Project.prototype._onSceneMouseDownInPoplylineDrawingMode
			// @see Project.prototype._onSceneMouseMoveInPoplylineDrawingMode
			// @see Project.prototype._onSceneMouseUpInPoplylineDrawingMode
			break;
			case 'edit-path':
			this._createPathControls();
			break;
			case 'draw-shape':
			scene.isDrawingMode = true;
			scene.freeDrawingBrush = new GeometryBrush(scene);
			scene.freeDrawingBrush.color = this.getState('activeStrokeColor');
			scene.freeDrawingBrush.width = this.getState('activeStrokeWidth');
			scene.freeDrawingBrush.fill = this.getState('activeFillColor');
			this.__prevActiveTool = this.state.previous('activeTool');
			break;
			case 'add-image':
			if (!this.__mediaFrame){
				this.__mediaFrame = media({
					multiple:false,
					library:{
						type:'image'
					}
				});
				this.__mediaFrame
				.on('select', () => {
					const attachment = this.__mediaFrame.state().get('selection').first().toJSON();
					FabricImage.fromURL(attachment.url, image => {
						// Put image to the center of canvas.
						image.left = this.getState('projectWidth') / 2;
						image.top = this.getState('projectHeight') / 2;
						image.wpId = attachment.id;
						image.wpSize = 'full';
						this.scene.add(image).setActiveObject(image);
					});
					this.setState('activeTool', 'select-mode');
				})
				.on('close', () => {
					this.setState('activeTool', 'select-mode');
				});
			}
			this.__mediaFrame.open();
			break;
			case 'stroke-color':
			case 'fill-color':
			case 'stroke-width':
			this.__prevActiveTool = this.state.previous('activeTool');
			break;
			case 'zoom-in':
			case 'zoom-out':
			scene.discardActiveObject().requestRenderAll();
			scene.forEachObject(shape => {
				shape.selectable = false;
			});
			scene.defaultCursor = activeTool; // Cursor name is the same as activeTool.
			scene.moveCursor = activeTool;
			scene.hoverCursor = activeTool;
			// Do more things in Project frame.
			// @see Project.prototype._onSceneMouseUpInZoomMode
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

	_setShapeGeometry(e){
		e.preventDefault();
		e.stopPropagation();
		const button = $(e.currentTarget);
		const viewBox = button.data('viewbox');
		if (this.scene.freeDrawingBrush){
			this.scene.freeDrawingBrush.type = button.data('type');
			this.scene.freeDrawingBrush.path = button.data('path');
			if (viewBox){
				const _vb = viewBox.split(' ');
				this.scene.freeDrawingBrush.viewBox = new Point(parseInt(_vb[2]) || 100, parseInt(_vb[3]) || 100);
			} else {
				this.scene.freeDrawingBrush.viewBox = new Point(100, 100);
			}
		}
		this.__needsShapesPopup = false;
		this.render();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onDocumentKeyDown(e){
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey){
			return;
		}
		const shape = this.scene.getActiveObject();
		if (shape && shape.isEditing){
			return; // Do nothing if we are editing text.
		}
		if (this.$body.find('input, button').is(':focus')){
			return; // Do nothing if we are focusing on an input, or button element.
		}
		const keysMap = {
			13:'select-mode', // Enter
			68:'free-draw', // D
			82:'draw-square', // R
			67:'draw-ellipse', // C
			84:'add-text', // T
			80:'draw-path', // P
			81:'draw-polyline', // Q
			73:'add-image', // I
			107:'zoom-in', // +
			109:'zoom-out' // -
		};
		if (shape && (shape.type === 'path' || shape.type === 'polygon' || shape.type === 'polyline')){
			keysMap[69] = 'edit-path'; // E
		}
		if (keysMap[e.keyCode]){
			this.setState('activeTool', keysMap[e.keyCode]);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {boolean} transformControls
	 */

	_createPathControls(transformControls){
		const activeObject = this.scene.getActiveObject();
		if (!activeObject){
			return;
		}
		if (activeObject.type === 'path'){
			activeObject._createPathControls(transformControls);
		} else if (activeObject.type === 'polygon' || activeObject.type === 'polyline'){
			activeObject._createPolylineControls(transformControls);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} btn
	 * @return {string}
	 */

	_getDisabled(btn){
		const shapeIds = this.getState('selectedShapeIds') || [''];
		const id = shapeIds[0] || '';
		const isPath = shapeIds.length === 1 && (id.indexOf('path') > 0 || id.indexOf('polygon') > 0 || id.indexOf('polyline') > 0);
		const disabled = (btn.name === 'edit-path' && !isPath);
		return disabled ? 'disabled' : '';
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} btn
	 * @return {boolean}
	 */

	_needsColorPopup(btn){
		const name = btn.name;
		const tool = this.getState('activeTool');
		return (name === 'stroke-color' || name === 'fill-color') && tool === name;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} btn
	 * @return {boolean}
	 */

	_needsSliderPopup(btn){
		const name = btn.name;
		const tool = this.getState('activeTool');
		return (name === 'stroke-width' && tool === name);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} btn
	 * @return {boolean}
	 */

	_needsShapesPopup(btn){
		const name = btn.name;
		const tool = this.getState('activeTool');
		return (name === 'draw-shape' && tool === name && this.__needsShapesPopup);
	}

});
