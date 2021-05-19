import {
	Rect,
	Point,
	util
} from 'fabric';

import ShapeBrush from './class-brush-shape.js';

/**
 * Brush for drawing rectangle, or square.
 * @since 1.0.0
 * @class
 * @augments ShapeBrush
 * @augments fabric.BaseBrush
 */

export default util.createClass(ShapeBrush, /** @lends SquareBrush.prototype */{

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
		this._saveAndTransform(ctx);
		ctx.beginPath();
		ctx.rect(position.x, position.y, Math.abs(size.x), Math.abs(size.y));
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
		this._shape = new Rect({
			width:Math.abs(size.x),
			height:Math.abs(size.y),
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
