import {
	Line,
	util
} from 'fabric';

import ShapeBrush from './class-brush-shape.js';

/**
 * Brush for drawing line.
 * @since 1.0.0
 * @class
 * @augments ShapeBrush
 * @augments fabric.BaseBrush
 */

export default util.createClass(ShapeBrush, /** @lends LineBrush.prototype */{

	/**
	 * Render context top when you are drawing shape.
	 * @since 1.0.0
	 * @access private
	 */

	_render(){
		const ctx = this.canvas.contextTop;
		const startPos = this._startPosition;
		const currPos = this._currentPosition;
		this._saveAndTransform(ctx);
		ctx.beginPath();
		ctx.moveTo(startPos.x, startPos.y);
		ctx.lineTo(currPos.x, currPos.y);
		ctx.stroke();
		ctx.restore();
	},

	/**
	 * Create shape object when you have finished drawing.
	 * @since 1.0.0
	 * @access private
	 */

	_finalizeAndAddShape(){
		const startPos = this._startPosition;
		const currPos = this._currentPosition;
		this._shape = new Line([startPos.x, startPos.y, currPos.x, currPos.y], {
			stroke:this.color,
			strokeWidth:this.width
		});
		this.canvas
		.add(this._shape)
		.requestRenderAll();
	}

});
