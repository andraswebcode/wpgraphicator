import {
	Rect,
	Path,
	Polyline,
	Circle,
	Point,
	util,
	IText,
	Object as FabricObject,
	controlsUtils
} from 'fabric';
import {
	each,
	isNumber,
	contains,
	last,
	pick,
	values as _values
} from 'underscore';
import {
	i18n
} from 'wordpress';

import Frame from './frame.js';
import {
	toFixed,
	serializePath,
	serializePoints,
	clamp,
	animatables,
	notificationMessages,
	createSceneBackground
} from './../utils/utils.js';
import {
	MIN_ZOOM,
	MAX_ZOOM
} from './../utils/constants.js';

const {
	findScaleToFit,
	transformPoint,
	qrDecompose
} = util;

const {
	renderCircleControl
} = controlsUtils;

const {
	__
} = i18n;

const {
	removeShape
} = notificationMessages;

/**
 * Project frame.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Frame
 * @augments Backbone.View
 */

export default Frame.extend(/** @lends Project.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'project',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'keydown .wpg-scene':'_onSceneKeyDown'
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this._initScene();
		this.listenTo(this.state, 'change:projectWidth change:projectHeight', this._createSceneClipPath);
		this.listenTo(this.state, 'change:projectWidth change:projectHeight', this._fitSceneToScreen);
		this.listenTo(this.state, 'change:projectBackground change:projectWidth change:projectHeight change:gridSize', this._setProjectBackground);
		this.listenTo(this.state, 'change:activeTool', this._finalizeDrawnPath);
		this.listenTo(this.state, 'change:activeTool', this._finalizeDrawnPolyline);
		this.$window.on('resize', this._setSceneSize.bind(this));
		this.$window.on('resize', this._fitSceneToScreen.bind(this));
		this.$document.on('keydown', this._onDocumentKeyDown.bind(this));
	},

	/**
	 * Set up scene dimensions, clip path, etc.
	 * @since 1.0.0
	 * @access private
	 */

	_initScene(){
		this._setSceneSize();
		this._createSceneClipPath(this.state);
		this._fitSceneToScreen();
		this._initSceneEvents();
	},

	/**
	 * Initialize scene events.
	 * @since 1.0.0
	 * @access private
	 */

	_initSceneEvents(){
		this.scene.on({
			'mouse:wheel':this._onSceneMouseWheel.bind(this),
			'mouse:move':this._onSceneMouseMove.bind(this),
			'object:modified':this._onSceneObjectModified.bind(this),
			'object:moving':this._onSceneObjectMoving.bind(this),
			'object:morphing':this._onSceneObjectMorphing.bind(this),
			'shape:created':this._onSceneShapeCreated.bind(this),
			'object:added':this._onSceneObjectAdded.bind(this),
			'object:removed':this._onSceneObjectRemoved.bind(this),
			'selection:created':this._onSceneSelect.bind(this),
			'selection:updated':this._onSceneSelect.bind(this),
			'selection:cleared':this._onSceneSelect.bind(this),
			'text:editing:exited':this._onExitedTextEditing.bind(this)
		});
		this.scene.on({
			'mouse:move':this._onSceneMouseMoveInAddTextMode.bind(this),
			'mouse:up':this._onSceneMouseUpInAddTextMode.bind(this)
		});
		this.scene.on({
			'mouse:down':this._onSceneMouseDownInPathDrawingMode.bind(this),
			'mouse:move':this._onSceneMouseMoveInPathDrawingMode.bind(this),
			'mouse:up':this._onSceneMouseUpInPathDrawingMode.bind(this)
		});
		this.scene.on({
			'mouse:down':this._onSceneMouseDownInPolylineDrawingMode.bind(this),
			'mouse:move':this._onSceneMouseMoveInPolylineDrawingMode.bind(this),
			'mouse:up':this._onSceneMouseUpInPolylineDrawingMode.bind(this)
		});
		this.scene.on({
			'mouse:up':this._onSceneMouseUpInZoomMode.bind(this)
		});
	},

	/**
	 * Set size of scene.
	 * @since 1.0.0
	 * @access private
	 */

	_setSceneSize(){
		this.$('.wpg-scene').hide();
		this.scene
		.setWidth(this.getWidth())
		.setHeight(this.getHeight());
		this.$('.wpg-scene').show();
	},

	/**
	 * Create clip path for scene to represent aspect ratio.
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 */

	_createSceneClipPath(state){
		const scene = this.scene;
		if (scene.clipPath){
			scene.clipPath.width = state.get('projectWidth');
			scene.clipPath.height = state.get('projectHeight');
			scene.requestRenderAll();
			return;
		}
		scene.clipPath = new Rect({
			top:-1,
			left:-1,
			width:state.get('projectWidth'),
			height:state.get('projectHeight'),
			originX:'left',
			originY:'top'
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_fitSceneToScreen(){
		const scene = this.scene;
		const {
			width,
			height
		} = scene;
		const projectWidth = this.getState('projectWidth');
		const projectHeight = this.getState('projectHeight');
		const zoom = findScaleToFit({
			width:projectWidth,
			height:projectHeight
		},{
			width:width - 10,
			height:height - 10 // Let it be a little bit smaller to get a border.
		});
		scene.setZoom(zoom);
		const vpt = scene.viewportTransform.slice();
		vpt[4] = (width / 2) - projectWidth * zoom / 2;
		vpt[5] = (height / 2) - projectHeight * zoom / 2;
		scene.setViewportTransform(vpt);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_setProjectBackground(){
		const zoom = this.scene.getZoom();
		const grid = this.getState('gridSize');
		const bgColor = this.getState('projectBackground');
		const pattern = createSceneBackground(zoom, grid, bgColor);
		this.scene.setBackgroundColor(pattern).requestRenderAll();
	},

	/**
	 * Zoom to point using mouse wheel.
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseWheel({e, pointer}){
		e.preventDefault();
		const scene = this.scene;
		const delta = e.deltaY;
		const {
			width,
			height
		} = scene;
		const projectWidth = this.getState('projectWidth');
		const projectHeight = this.getState('projectHeight');
		let zoom = scene.getZoom();
		zoom *= 0.999 ** delta;
		if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
		if (zoom < MIN_ZOOM) zoom = MIN_ZOOM;
		scene.zoomToPoint(pointer, zoom);
		const vpt = scene.viewportTransform.slice();
		if (zoom < Math.min(width / projectWidth, height / projectHeight)){
			vpt[4] = (width / 2) - projectWidth * zoom / 2;
			vpt[5] = (height / 2) - projectHeight * zoom / 2;
		} else {
			if (vpt[4] >= 0){
				vpt[4] = 0;
			} else if (vpt[4] < width - projectWidth * zoom){
				vpt[4] = width - projectWidth * zoom;
			}
			if (vpt[5] >= 0){
				vpt[5] = 0;
			} else if (vpt[5] < height - projectHeight * zoom){
				vpt[5] = height - projectHeight * zoom;
			}
		}
		this._setProjectBackground();
		scene.setViewportTransform(vpt);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneSelect({selected, deselected, target}){
		const ids = (
			target?.type === 'activeSelection' ? target._objects :
			(selected && selected.length) ? selected :
			(deselected && deselected[0] && target?.type && target?.type !== 'activeSelection') ? [target] : []
		).map(shape => shape.id);
		this.setState('selectedShapeIds', ids);
		const activeTool = this.getState('activeTool');
		if (
			!this.scene.isDrawingMode &&
			activeTool !== 'draw-path' &&
			activeTool !== 'draw-polyline' &&
			activeTool !== 'zoom-in' &&
			activeTool !== 'zoom-out'
		){
			this.setState('activeTool', 'select-mode');
		}
		if (deselected && deselected.length === 1){
			const _deselected = deselected[0];
			if (_deselected._createPathControls){ // Is path.
				_deselected._createPathControls(true); // Reset default transform controls.
			} else if (_deselected._createPolylineControls){ // Is polygon or polyline.
				_deselected._createPolylineControls(true); // Reset default transform controls.
			}
		}
	},

	/**
	 * Refocus on canvas, when we exit editing,
	 * because we was focused on the hidden textarea of the iText.
	 * @see fabric.IText.prototype.hiddenTextarea
	 * @since 1.0.0
	 * @access private
	 */

	_onExitedTextEditing(){
		this.$('.wpg-scene').trigger('focus');
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneObjectAdded({target}){
		const shapeModel = this.shapes.add({
			id:target.id,
			type:target.type
		});
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'add', target);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneObjectRemoved({target}){
		const model = this.shapes.get(target.id);
		if (!model){
			return;
		}
		model.trigger('wpg:pushtohistorystack', model, 'remove', target);
		this.shapes.remove(model);
		this.anime.remove(target._animationCache);
		if (this.scene._objects.length === 0){
			this.anime.duration = 0;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseMoveInAddTextMode({absolutePointer}){
		if (this.getState('activeTool') !== 'add-text'){
			return;
		}
		const ctx = this.scene.contextTop;
		const v = this.scene.viewportTransform;
		const fontSize = IText.prototype.fontSize;
		const text = __('Text', 'wpgraphicator');
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const {
			x,
			y
		} = absolutePointer;
		this.scene.clearContext(ctx);
		ctx.save();
		ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
		ctx.globalAlpha = 0.4;
		ctx.fillStyle = this.getState('activeFillColor');
		ctx.strokeStyle = this.getState('activeStrokeColor');
		ctx.lineWidth = this.getState('activeStrokeWidth');
		ctx.font = `${fontSize}px serif`;
		const metrics = ctx.measureText(text);
		const width = metrics?.width || 0;
		const height = (metrics?.fontBoundingBoxAscent || 0) - (metrics?.fontBoundingBoxDescent || 0);
		const posX = snapToGrid ? Math.round((x - (width / 2)) / gridSize) * gridSize : x - (width / 2);
		const posY = snapToGrid ? Math.round(y / gridSize) * gridSize + (height / 2) : y + (height / 2);
		ctx.fillText(text, posX, posY);
		ctx.strokeText(text, posX, posY);
		ctx.restore();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseUpInAddTextMode({absolutePointer}){
		if (this.getState('activeTool') !== 'add-text'){
			return;
		}
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const text = __('Text', 'wpgraphicator');
		const iText = new IText(text, {
			top:snapToGrid ? Math.round(absolutePointer.y / gridSize) * gridSize : toFixed(absolutePointer.y),
			left:snapToGrid ? Math.round(absolutePointer.x / gridSize) * gridSize : toFixed(absolutePointer.x),
			selectionStart:0,
			selectionEnd:text.length,
			stroke:this.getState('activeStrokeColor'),
			strokeWidth:this.getState('activeStrokeWidth'),
			fill:this.getState('activeFillColor')
		});
		this.scene.add(iText).setActiveObject(iText);
		this.scene.clearContext(this.scene.contextTop);
		iText.enterEditing();
		setTimeout(() => this.setState('activeTool', 'select-mode'), 40);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseDownInPathDrawingMode({absolutePointer, transform}){
		if (this.getState('activeTool') !== 'draw-path'){
			return;
		}
		const action = transform && transform.action;
		if (action === 'modifyPath'){
			return;
		}
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const x = snapToGrid ? Math.round(absolutePointer.x / gridSize) * gridSize : toFixed(absolutePointer.x);
		const y = snapToGrid ? Math.round(absolutePointer.y / gridSize) * gridSize : toFixed(absolutePointer.y);
		if (!this.__path){
			this.__path = new Path(`M ${x} ${y}`, {
				top:y,
				left:x,
				lockMovementX:true,
				lockMovementY:true,
				hasBorders:false,
				stroke:this.getState('activeStrokeColor'),
				strokeWidth:this.getState('activeStrokeWidth'),
				fill:this.getState('activeFillColor')
			});
			this.scene.add(this.__path);
		} else {
			const path = this.__path.path.slice();
			const prevX = snapToGrid ? Math.round(this.__prevPathPoint.x / gridSize) * gridSize : toFixed(this.__prevPathPoint.x);
			const prevY = snapToGrid ? Math.round(this.__prevPathPoint.y / gridSize) * gridSize : toFixed(this.__prevPathPoint.y);
			path.push(['C', prevX, prevY, x, y, x, y]);
			this.__path.saveState();
			this.__path.set('path', path);
		}
		this.__path._createPathControls(false, true);
		this.__path._currentPathControl = last(_values(pick(this.__path.controls, c => c.type === 'p')));
		this.scene.setActiveObject(this.__path).requestRenderAll();
		this.__prevPathPoint = absolutePointer.clone();
		this.__isMoovingNewPathPoint = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseMoveInPathDrawingMode({absolutePointer, transform}){
		if (this.getState('activeTool') !== 'draw-path'){
			return;
		}
		if (!this.__path || !this.__isMoovingNewPathPoint){
			return;
		}
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const x = snapToGrid ? Math.round(absolutePointer.x / gridSize) * gridSize : toFixed(absolutePointer.x);
		const y = snapToGrid ? Math.round(absolutePointer.y / gridSize) * gridSize : toFixed(absolutePointer.y);
		const path = this.__path.path;
		const lastCommand = path[path.length - 1];
		if (lastCommand[0] === 'C'){
			lastCommand[3] = x;
			lastCommand[4] = y;
			this.__prevPathPoint = new Point(
				lastCommand[5] + (lastCommand[5] - x),
				lastCommand[6] + (lastCommand[6] - y)
			);
		} else {
			this.__prevPathPoint = new Point(
				lastCommand[1] + (x - lastCommand[1]),
				lastCommand[2] + (y - lastCommand[2])
			);
		}
		this.__drawNextPathControlPoint();
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseUpInPathDrawingMode({absolutePointer, transform}){
		if (this.getState('activeTool') !== 'draw-path'){
			return;
		}
		this.scene.clearContext(this.scene.contextTop);
		if (this.__isMoovingNewPathPoint){
			this.scene.fire('object:modified', {
				target:this.__path,
				action:'modifyPath'
			});
		}
		this.__isMoovingNewPathPoint = false;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_finalizeDrawnPath(){
		if (!this.__path){
			return;
		}
		if (this.__path.path.length <= 1){
			this.scene.remove(this.__path);
			this.__path = null;
			return;
		}
		const dim = this.__path._calcDimensions();
		this.__path._adjustPath();
		this.__path._updateBoundingBox();
		this.__path.top = dim.top + dim.height / 2;
		this.__path.left = dim.left + dim.width / 2;
		this.__path.lockMovementX = false;
		this.__path.lockMovementY = false;
		this.__path.hasBorders = true;
		this.__path = null;
		this.scene.fire('path:created', {});
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	__drawNextPathControlPoint(){
		if (!this.__path || !this.__prevPathPoint){
			return;
		}
		const {
			x,
			y
		} = transformPoint(this.__prevPathPoint, this.scene.viewportTransform);
		const lastCommand = this.__path.path[this.__path.path.length - 1];
		const move = transformPoint({
			x:lastCommand[0] === 'C' ? lastCommand[5] : lastCommand[1],
			y:lastCommand[0] === 'C' ? lastCommand[6] : lastCommand[2]
		}, this.scene.viewportTransform);
		const ctx = this.scene.contextTop;
		this.scene.clearContext(ctx);
		renderCircleControl.call(this, ctx, x, y, {}, this.__path);
		ctx.save();
		ctx.strokeStyle = this.__path.cornerColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(move.x, move.y);
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.restore();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseDownInPolylineDrawingMode({absolutePointer, transform}){
		if (this.getState('activeTool') !== 'draw-polyline'){
			return;
		}
		const action = transform && transform.action;
		if (action === 'modifyPolyline'){
			return;
		}
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const x = snapToGrid ? Math.round(absolutePointer.x / gridSize) * gridSize : toFixed(absolutePointer.x);
		const y = snapToGrid ? Math.round(absolutePointer.y / gridSize) * gridSize : toFixed(absolutePointer.y);
		if (!this.__polyline){
			this.__polyline = new Polyline([{x, y}], {
				top:y,
				left:x,
				lockMovementX:true,
				lockMovementY:true,
				hasBorders:false,
				stroke:this.getState('activeStrokeColor'),
				strokeWidth:this.getState('activeStrokeWidth'),
				fill:this.getState('activeFillColor')
			});
			this.scene.add(this.__polyline);
		} else {
			const points = this.__polyline.points.slice();
			points.push({x, y});
			this.__polyline.saveState();
			this.__polyline.set('points', points);
		}
		this.__polyline._createPolylineControls(false, true);
		this.__polyline._currentPolylineControl = last(_values(this.__polyline.controls));
		this.scene.setActiveObject(this.__polyline).requestRenderAll();
		this.__isMoovingNewPolylinePoint = true;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseMoveInPolylineDrawingMode({absolutePointer}){
		if (this.getState('activeTool') !== 'draw-polyline'){
			return;
		}
		if (!this.__polyline || !this.__isMoovingNewPolylinePoint){
			return;
		}
		const points = this.__polyline.points;
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		const x = snapToGrid ? Math.round(absolutePointer.x / gridSize) * gridSize : toFixed(absolutePointer.x);
		const y = snapToGrid ? Math.round(absolutePointer.y / gridSize) * gridSize : toFixed(absolutePointer.y);
		points[points.length - 1].x = x;
		points[points.length - 1].y = y;
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseUpInPolylineDrawingMode(){
		if (this.getState('activeTool') !== 'draw-polyline'){
			return;
		}
		if (this.__isMoovingNewPolylinePoint){
			this.scene.fire('object:modified', {
				target:this.__polyline,
				action:'modifyPolyline'
			});
		}
		this.__isMoovingNewPolylinePoint = false;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_finalizeDrawnPolyline(){
		if (!this.__polyline){
			return;
		}
		if (this.__polyline.points.length <= 1){
			this.scene.remove(this.__polyline);
			this.__polyline = null;
			return;
		}
		const dim = this.__polyline._calcDimensions();
		this.__polyline._adjustPoints();
		this.__polyline._updateBoundingBox();
		this.__polyline.top = dim.top + dim.height / 2;
		this.__polyline.left = dim.left + dim.width / 2;
		this.__polyline.lockMovementX = false;
		this.__polyline.lockMovementY = false;
		this.__polyline.hasBorders = true;
		this.__polyline = null;
		this.scene.fire('path:created', {});
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseUpInZoomMode({pointer}){
		if (this.getState('activeTool') !== 'zoom-in' && this.getState('activeTool') !== 'zoom-out'){
			return;
		}
		const scene = this.scene;
		const zoomIn = (this.getState('activeTool') === 'zoom-in');
		const projectWidth = this.getState('projectWidth');
		const projectHeight = this.getState('projectHeight');
		const {
			width,
			height
		} = scene;
		let zoom = scene.getZoom();
		if (zoomIn){
			zoom *= 1.2;
		} else {
			zoom /= 1.2;
		}
		if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
		if (zoom < MIN_ZOOM) zoom = MIN_ZOOM;
		scene.zoomToPoint(pointer, zoom);
		const vpt = scene.viewportTransform.slice();
		if (zoom < Math.min(width / projectWidth, height / projectHeight)){
			vpt[4] = (width / 2) - projectWidth * zoom / 2;
			vpt[5] = (height / 2) - projectHeight * zoom / 2;
		} else {
			if (vpt[4] >= 0){
				vpt[4] = 0;
			} else if (vpt[4] < width - projectWidth * zoom){
				vpt[4] = width - projectWidth * zoom;
			}
			if (vpt[5] >= 0){
				vpt[5] = 0;
			} else if (vpt[5] < height - projectHeight * zoom){
				vpt[5] = height - projectHeight * zoom;
			}
		}
		this._setProjectBackground();
		scene.setViewportTransform(vpt);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneMouseMove({absolutePointer, target}){
		const width = this.getState('projectWidth');
		const height = this.getState('projectHeight');
		this.setState('pointerPosition', {
			x:toFixed(clamp(absolutePointer.x, 0, width)),
			y:toFixed(clamp(absolutePointer.y, 0, height))
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneObjectModified({target, action}){
		if (target.type === 'activeSelection'){
			const models = target._objects.map(({id}) => this.shapes.get(id));
			each(target._objects, object => {
				const matrix = object.calcTransformMatrix();
				const {
					angle,
					scaleX,
					scaleY,
					skewX,
					skewY,
					translateX,
					translateY
				} = qrDecompose(matrix);
				const shapeModel = this.shapes.get(object.id);
				this.__updateProperties({
					angle,
					scaleX,
					scaleY,
					skewX,
					skewY,
					left:translateX,
					top:translateY
				}, shapeModel, action);
			});
			this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', target._objects);
			return;
		}
		const shapeModel = this.shapes.get(target.id);
		this.__updateProperties(target, shapeModel, action);
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', target);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneObjectMoving({target}){
		const snapToGrid = this.getState('snapToGrid');
		if (!snapToGrid){
			return;
		}
		const gridSize = this.getState('gridSize');
		const {
			left,
			top
		} = target;
		target.set({
			left:Math.round(left / gridSize) * gridSize,
			top:Math.round(top / gridSize) * gridSize
		});
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneObjectMorphing({transform, target, e}){
		const snapToGrid = this.getState('snapToGrid');
		if (!snapToGrid){
			return;
		}
		const gridSize = this.getState('gridSize');
		const control = target.controls[transform.corner];
		if (transform.action === 'modifyPath'){
			const path = target.path;
			const command = path[control.index];
			command[control.xIndex] = Math.round(command[control.xIndex] / gridSize) * gridSize;
			command[control.yIndex] = Math.round(command[control.yIndex] / gridSize) * gridSize;
			if (control.type === 'p'){
				if (control.controlPoint1){
					const c = target.controls[control.controlPoint1];
					path[c.index][c.xIndex] = Math.round(path[c.index][c.xIndex] / gridSize) * gridSize;
					path[c.index][c.yIndex] = Math.round(path[c.index][c.yIndex] / gridSize) * gridSize;
				}
				if (control.controlPoint2){
					const c = target.controls[control.controlPoint2];
					path[c.index][c.xIndex] = Math.round(path[c.index][c.xIndex] / gridSize) * gridSize;
					path[c.index][c.yIndex] = Math.round(path[c.index][c.yIndex] / gridSize) * gridSize;
				}
			} else {
				if (e.ctrlKey || e.metaKey){
					const p = target.controls[control.connectPoint1];
					const c = control.type === 'c2' ? target.controls[p.controlPoint2] : target.controls[p.controlPoint1];
					if (c){
						path[c.index][c.xIndex] = Math.round(path[c.index][c.xIndex] / gridSize) * gridSize;
						path[c.index][c.yIndex] = Math.round(path[c.index][c.yIndex] / gridSize) * gridSize;
					}
				}
			}
		} else if (transform.action === 'modifyPolyline'){
			const point = target.points[control.index];
			point.x = Math.round(point.x / gridSize) * gridSize;
			point.y = Math.round(point.y / gridSize) * gridSize;
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_onSceneShapeCreated({shape}){
		if (!shape || shape.type !== 'ellipse'){
			return;
		}
		const {
			width,
			height
		} = shape;
		if (width === height){
			this.sendNotice(
				__('You have drawn an ellipse with same width and height. Do you want to replace this with a circle?', 'wpgraphicator'),
				'warning',
				() => {
					const {
						top,
						left,
						stroke,
						strokeWidth,
						fill,
						rx
					} = shape;
					const circle = new Circle({
						top,
						left,
						stroke,
						strokeWidth,
						fill,
						radius:rx
					});
					this.scene
					.remove(shape)
					.add(circle)
					.requestRenderAll();
				},
				true
			);
		}
	},

	/**
	 * Handle keydown events on canvas.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onSceneKeyDown(e){
		const shape = this.scene.getActiveObject();
		const activeTool = this.getState('activeTool');
		const snapToGrid = this.getState('snapToGrid');
		const gridSize = this.getState('gridSize');
		switch (e.keyCode){
			case 67: // C
			if ((e.ctrlKey || e.metaKey) && shape){
				this.clipboard.copy(shape, 'shape');
				this.clipboard.__shapeTop = shape.top;
				this.clipboard.__shapeLeft = shape.left;
			}
			break;
			case 46: // Delete
			if (shape){
				switch (activeTool){
					case 'select-mode':
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
					break;
					case 'draw-path':
					if (shape._currentPathControl){
						const control = shape._currentPathControl;
						if (control.type === 'c1'){
							// Do something...
						} else {
							shape.path = shape.path.filter(p => p[0] === 'M' || p !== shape.path[control.index]);
						}
						shape._createPathControls(false, true);
						this.scene
						.fire('object:modified', {
							target:shape,
							action:control.actionName
						})
						.requestRenderAll();
					}
					break;
					case 'draw-polyline':
					if (shape._currentPolylineControl){
						shape.points = shape.points.filter(p => p !== shape.points[shape._currentPolylineControl.index]);
						shape._createPolylineControls(false, true);
						if (shape.points.length > 1){
							shape._currentPolylineControl = last(_values(shape.controls));
						}
						this.scene
						.fire('object:modified', {
							target:shape,
							action:shape._currentPolylineControl.actionName
						})
						.requestRenderAll();
					}
					break;
					default:
					break;
				}
			}
			break;
			case 38: // Arrow up
			if (shape && activeTool === 'select-mode'){
				e.preventDefault();
				shape.set('top', snapToGrid ? Math.round(shape.top / gridSize) * gridSize - gridSize : shape.top - 1);
				this.scene
				.fire('object:modified', {
					target:shape,
					action:'drag'
				})
				.requestRenderAll();
			}
			break;
			case 40: // Arrow down
			if (shape && activeTool === 'select-mode'){
				e.preventDefault();
				shape.set('top', snapToGrid ? Math.round(shape.top / gridSize) * gridSize + gridSize : shape.top + 1);
				this.scene
				.fire('object:modified', {
					target:shape,
					action:'drag'
				})
				.requestRenderAll();
			}
			break;
			case 37: // Arrow left
			if (shape && activeTool === 'select-mode'){
				e.preventDefault();
				shape.set('left', snapToGrid ? Math.round(shape.left / gridSize) * gridSize - gridSize : shape.left - 1);
				this.scene
				.fire('object:modified', {
					target:shape,
					action:'drag'
				})
				.requestRenderAll();
			}
			break;
			case 39: // Arrow right
			if (shape && activeTool === 'select-mode'){
				e.preventDefault();
				shape.set('left', snapToGrid ? Math.round(shape.left / gridSize) * gridSize + gridSize : shape.left + 1);
				this.scene
				.fire('object:modified', {
					target:shape,
					action:'drag'
				})
				.requestRenderAll();
			}
			break;
			default:
			break;
		}
	},

	/**
	 * Document on keydown event handler.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_onDocumentKeyDown(e){
		const shape = this.scene.getActiveObject();
		const isNotTextEditing = !(shape && shape.isEditing);
		switch (e.keyCode){
			case 86: // V
			if (e.ctrlKey || e.metaKey){
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
			}
			break;
			case 27: // Escape
			if (this.getState('activeTool') === 'select-mode'){
				e.preventDefault();
				this.scene
				.discardActiveObject()
				.requestRenderAll();
			}
			break;
			case 90: // Z
			if ((e.ctrlKey || e.metaKey) && isNotTextEditing){
				e.preventDefault();
				this.history.undo();
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
	 * @param {object} shape
	 * @param {object} shapeModel
	 * @param {string} action
	 */

	__updateProperties(shape, shapeModel, action){
		switch (action){
			case 'drag':
			this.__updateProperty(shapeModel, 'top', toFixed(shape.top));
			this.__updateProperty(shapeModel, 'left', toFixed(shape.left));
			break;
			case 'rotate':
			this.__updateProperty(shapeModel, 'angle', toFixed(shape.angle));
			break;
			case 'scale':
			this.__updateProperty(shapeModel, 'scaleX', toFixed(shape.scaleX));
			this.__updateProperty(shapeModel, 'scaleY', toFixed(shape.scaleY));
			break;
			case 'scaleX':
			this.__updateProperty(shapeModel, 'scaleX', toFixed(shape.scaleX));
			break;
			case 'scaleY':
			this.__updateProperty(shapeModel, 'scaleY', toFixed(shape.scaleY));
			break;
			case 'skewX':
			this.__updateProperty(shapeModel, 'skewX', toFixed(shape.skewX));
			break;
			case 'skewY':
			this.__updateProperty(shapeModel, 'skewY', toFixed(shape.skewY));
			break;
			case 'modifyPath':
			this.__updateProperty(shapeModel, 'path', serializePath(shape.path));
			if (this.getState('activeTool') !== 'draw-path'){
				this.scene.requestRenderAll();
			}
			break;
			case 'modifyPolyline':
			this.__updateProperty(shapeModel, 'points', serializePoints(shape.points));
			if (this.getState('activeTool') !== 'draw-polyline'){
				this.scene.requestRenderAll();
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
	 * @param {object} shapeModel
	 * @param {string} property
	 * @param {mixed} value
	 * @param {float|int} time
	 */

	__updateProperty(shapeModel, property, value, time, force){
		if (!contains(animatables, property)){
			return;
		}
		const shapeId = shapeModel ? shapeModel.get('id') : '';
		const currentTime = time === undefined ? this.getState('currentTime') : time;
		const seconds = this.getState('seconds');
		const props = shapeModel && shapeModel._properties;
		let propModel = props && props.get(property);
		if (!propModel && force){
			propModel = props.add({
				id:property,
				shapeId
			});
		}
		if (!propModel){
			return;
		}
		const tlModel = propModel._transitions.findWhere({
			second:currentTime
		});
		if (tlModel){
			tlModel.set({
				value
			});
		} else {
			propModel._transitions.add({
				shapeId,
				property,
				second:Math.min(currentTime, seconds),
				value,
				easing:this.getState('defaultEasing')
			});
		}
	}

});
