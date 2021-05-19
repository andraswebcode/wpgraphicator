import {
	Polygon,
	Polyline,
	Path,
	Point,
	util
} from 'fabric';

import ShapeBrush from './class-brush-shape.js';
import {
	toFixed,
	serializePath
} from './../utils/utils.js';

const {
	parsePath
} = util;

/**
 * Brush for drawing any registered shapes from the shape library.
 * @see shape-library.js shapeLibrary
 * @see shape-library.js registerShape
 * @since 1.0.0
 * @class
 * @augments ShapeBrush
 * @augments fabric.BaseBrush
 */

export default util.createClass(ShapeBrush, /** @lends GeometryBrush.prototype */{

	/**
	 * Type of svg element: 'path', 'polygon', or 'polyline'.
	 * @since 1.0.0
	 * @var {string}
	 */

	type:'',

	/**
	 * Path commands, or points.
	 * @since 1.0.0
	 * @var {string}
	 */

	path:'',

	/**
	 * Svg viewBox.
	 * @since 1.0.0
	 * @var {object}
	 */

	viewBox:new Point(100, 100),

	/**
	 *
	 * @since 1.0.0
	 * @param {object} pointer
	 * @param {object} options
	 */

	onMouseDown(pointer, options){
		this._path = this.type === 'path' ? parsePath(this.path) : this.path.split(' ').map(toFixed);
		this.callSuper('onMouseDown', pointer, options);
	},

	/**
	 * Render context top when you are drawing shape.
	 * @since 1.0.0
	 * @access private
	 */

	_render(){
		const ctx = this.canvas.contextTop;
		this._saveAndTransform(ctx);
		if (this.type === 'path'){
			this._renderPath(ctx);
		} else {
			this._renderPolyline(ctx);
		}
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},

	/**
	 * Render context top when this type is path.
	 * @since 1.0.0
	 * @access private
	 * @param {CanvasRenderingContext2D} ctx
	 */

	_renderPath(ctx){
		const {
			size,
			position
		} = this._getSizeAndPosition();
		const viewBox = this.viewBox;
		const path = this._path;
		let i, c, cp1x, cp1y, cp2x, cp2y, x, y;
		ctx.beginPath();
		for (i = 0; i < path.length; i++){
			c = path[i];
			switch (c[0]){ // Command
				case 'M':
				x = size.x < 0 ? position.x - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x + position.x;
				y = size.y < 0 ? position.y - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y + position.y;
				ctx.moveTo(x, y);
				break;
				case 'L':
				x = size.x < 0 ? position.x - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x + position.x;
				y = size.y < 0 ? position.y - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y + position.y;
				ctx.lineTo(x, y);
				break;
				case 'Q':
				cp1x = size.x < 0 ? position.x - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x + position.x;
				cp1y = size.y < 0 ? position.y - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y + position.y;
				x = size.x < 0 ? position.x - (c[3] / viewBox.x) * size.x : (c[3] / viewBox.x) * size.x + position.x;
				y = size.y < 0 ? position.y - (c[4] / viewBox.y) * size.y : (c[4] / viewBox.y) * size.y + position.y;
				ctx.quadraticCurveTo(cp1x, cp1y, x, y);
				break;
				case 'C':
				cp1x = size.x < 0 ? position.x - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x + position.x;
				cp1y = size.y < 0 ? position.y - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y + position.y;
				cp2x = size.x < 0 ? position.x - (c[3] / viewBox.x) * size.x : (c[3] / viewBox.x) * size.x + position.x;
				cp2y = size.y < 0 ? position.y - (c[4] / viewBox.y) * size.y : (c[4] / viewBox.y) * size.y + position.y;
				x = size.x < 0 ? position.x - (c[5] / viewBox.x) * size.x : (c[5] / viewBox.x) * size.x + position.x;
				y = size.y < 0 ? position.y - (c[6] / viewBox.y) * size.y : (c[6] / viewBox.y) * size.y + position.y;
				ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
				break;
				case 'z':
				case 'Z':
				ctx.closePath();
				break;
				default:
				break;
			}
		}
	},

	/**
	 * Render context top when this type is polyline or polygon.
	 * @since 1.0.0
	 * @access private
	 * @param {CanvasRenderingContext2D} ctx
	 */

	_renderPolyline(ctx){
		const {
			size,
			position
		} = this._getSizeAndPosition();
		const viewBox = this.viewBox;
		const path = this._path;
		let i, x, y, _x, _y;
		ctx.beginPath();
		for (i = 0; i < path.length; i += 2){
			x = path[i];
			y = path[i + 1];
			_x = (x / viewBox.x) * size.x;
			_y = (y / viewBox.y) * size.y;
			if (i === 0){
				ctx.moveTo(
					size.x < 0 ? position.x - _x : _x + position.x,
					size.y < 0 ? position.y - _y : _y + position.y
				);
			} else {
				ctx.lineTo(
					size.x < 0 ? position.x - _x : _x + position.x,
					size.y < 0 ? position.y - _y : _y + position.y
				);
			}
		}
		if (this.type === 'polygon'){
			ctx.closePath();
		}
	},

	/**
	 * Create shape object when you have finished drawing.
	 * @since 1.0.0
	 * @access private
	 */

	_finalizeAndAddShape(){
		const {
			size,
			position
		} = this._getSizeAndPosition();
		const pos = position.add(
			new Point(
				size.x < 0 ? - size.x : size.x,
				size.y < 0 ? - size.y : size.y
			).divide(2)
		);
		const viewBox = this.viewBox;
		const path = this._path;
		let shape = {};
		if (this.type === 'path'){
			const commands = [];
			let i, c;
			for (i = 0; i < path.length; i++){
				c = path[i];
				switch (c[0]){ // Command.
					case 'M':
					commands.push([
						'M',
						size.x < 0 ? - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x,
						size.y < 0 ? - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y
					]);
					break;
					case 'L':
					commands.push([
						'L',
						size.x < 0 ? - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x,
						size.y < 0 ? - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y
					]);
					break;
					case 'Q':
					commands.push([
						'Q',
						size.x < 0 ? - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x,
						size.y < 0 ? - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y,
						size.x < 0 ? - (c[3] / viewBox.x) * size.x : (c[3] / viewBox.x) * size.x,
						size.y < 0 ? - (c[4] / viewBox.y) * size.y : (c[4] / viewBox.y) * size.y
					]);
					break;
					case 'C':
					commands.push([
						'C',
						size.x < 0 ? - (c[1] / viewBox.x) * size.x : (c[1] / viewBox.x) * size.x,
						size.y < 0 ? - (c[2] / viewBox.y) * size.y : (c[2] / viewBox.y) * size.y,
						size.x < 0 ? - (c[3] / viewBox.x) * size.x : (c[3] / viewBox.x) * size.x,
						size.y < 0 ? - (c[4] / viewBox.y) * size.y : (c[4] / viewBox.y) * size.y,
						size.x < 0 ? - (c[5] / viewBox.x) * size.x : (c[5] / viewBox.x) * size.x,
						size.y < 0 ? - (c[6] / viewBox.y) * size.y : (c[6] / viewBox.y) * size.y
					]);
					break;
					case 'z':
					case 'Z':
					commands.push(['Z']);
					break;
					default:
					break;
				}
			}
			shape = new Path(serializePath(commands), {
				left:pos.x,
				top:pos.y,
				stroke:this.color,
				strokeWidth:this.width,
				fill:this.fill
			});
		} else {
			const points = [];
			let i, x, y;
			for (i = 0; i < path.length; i += 2){
				x = path[i];
				y = path[i + 1];
				points.push(
					new Point(
						size.x < 0 ? - (x / viewBox.x) * size.x : (x / viewBox.x) * size.x,
						size.y < 0 ? - (y / viewBox.y) * size.y : (y / viewBox.y) * size.y
					)
				);
			}
			shape = (this.type === 'polygon') ? new Polygon(points, {
				left:pos.x,
				top:pos.y,
				stroke:this.color,
				strokeWidth:this.width,
				fill:this.fill
			}) : new Polyline(points, {
				left:pos.x,
				top:pos.y,
				stroke:this.color,
				strokeWidth:this.width,
				fill:this.fill
			});
		}
		this._shape = shape;
		this.canvas.add(shape).requestRenderAll();
	}

});
