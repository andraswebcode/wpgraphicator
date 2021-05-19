import {
	Ellipse,
	Point,
	util
} from 'fabric';

import ShapeBrush from './class-brush-shape.js';

/**
 * Brush for drawing ellipse, or circle.
 * @since 1.0.0
 * @class
 * @augments ShapeBrush
 * @augments fabric.BaseBrush
 */

export default util.createClass(ShapeBrush, /** @lends EllipseBrush.prototype */{

	/**
	 * Render context top when you are drawing shape.
	 * @since 1.0.0
	 * @access private
	 */

	_render(){
		const ctx = this.canvas.contextTop;
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
		this._saveAndTransform(ctx);
		ctx.beginPath();
		ctx.ellipse(pos.x, pos.y, Math.abs(size.x / 2), Math.abs(size.y / 2), 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
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
		this._shape = new Ellipse({
			rx:Math.abs(size.x / 2),
			ry:Math.abs(size.y / 2),
			left:pos.x,
			top:pos.y,
			stroke:this.color,
			strokeWidth:this.width,
			fill:this.fill
		});
		this.canvas
		.add(this._shape)
		.requestRenderAll();
	}

});
