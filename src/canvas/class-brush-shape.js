import {
	BaseBrush,
	Point,
	Object as FabricObject,
	util
} from 'fabric';

/**
 * The base shape brush.
 * @since 1.0.0
 * @class
 * @abstract
 * @augments fabric.BaseBrush
 * @mixes fabric.Object
 */

export default util.createClass(BaseBrush, /** @lends ShapeBrush.prototype */{

	/**
	 *
	 * @since 1.0.0
	 */

	strokeLineCap:FabricObject.prototype.strokeLineCap,

	/**
	 *
	 * @since 1.0.0
	 */

	strokeLineJoin:FabricObject.prototype.strokeLineJoin,

	/**
	 * If grid size isn't 0, the shape size will snap to grid.
	 * @since 1.0.0
	 * @var {number}
	 */

	gridSize:0,

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 * @param {object} canvas
	 */

	initialize(canvas){
		this.canvas = canvas;
		this._reset();
	},

	/**
	 *
	 * @since 1.0.0
	 * @param {object} pointer
	 * @param {object} options
	 */

	onMouseDown(pointer, options){
		if (!this.canvas._isMainEvent(options.e)){
			return;
		}
		this._reset();
		this._startPosition.setFromPoint(pointer);
	},

	/**
	 *
	 * @since 1.0.0
	 * @param {object} pointer
	 * @param {object} options
	 */

	onMouseMove(pointer, options){
		if (!this.canvas._isMainEvent(options.e)){
			return;
		}
		this._ctrlKey = options.e.ctrlKey || options.e.metaKey;
		this._currentPosition.setFromPoint(pointer);
		this.canvas.clearContext(this.canvas.contextTop);
		this._render();
	},

	/**
	 *
	 * @since 1.0.0
	 * @param {object} options
	 */

	onMouseUp(options){
		if (!this.canvas._isMainEvent(options.e)){
			return true;
		}
		this.canvas.clearContext(this.canvas.contextTop);
		if (this._currentPosition.x && this._currentPosition.y){ // Check if shape has size, and you didn't click.
			this._finalizeAndAddShape();
			this.canvas.fire('shape:created', {
				shape:this._shape
			});
		}
		this._ctrlKey = false;
		return false;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {object}
	 */

	_getSizeAndPosition(){
		const startPos = this._startPosition;
		const currPos = this._currentPosition;
		const size = currPos.subtract(startPos);
		const gridSize = this.gridSize;
		if (this._ctrlKey){
			size.x = Math.max(size.x, size.y);
			size.y = Math.max(size.x, size.y);
		}
		const position = startPos.subtract(
			new Point(
				size.x < 0 ? Math.abs(size.x) : 0,
				size.y < 0 ? Math.abs(size.y) : 0
			)
		);
		if (gridSize){
			size.x = Math.round(size.x / gridSize) * gridSize;
			size.y = Math.round(size.y / gridSize) * gridSize;
			position.x = Math.round(position.x / gridSize) * gridSize;
			position.y = Math.round(position.y / gridSize) * gridSize;
		}
		return {
			size,
			position
		};
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_reset(){
		this._setBrushStyles();
		if (this.fill){
			const ctx = this.canvas.contextTop;
			ctx.fillStyle = this.fill;
		}
		this._startPosition = new Point(0, 0);
		this._currentPosition = new Point(0, 0);
	},

	/**
	 * Render context top when you are drawing shape.
	 * @since 1.0.0
	 * @access protected
	 */

	_render(){},

	/**
	 * Create shape object when you have finished drawing.
	 * @since 1.0.0
	 * @access private
	 */

	_finalizeAndAddShape(){}

});
