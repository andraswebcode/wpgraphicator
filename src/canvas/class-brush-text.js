import {
	BaseBrush,
	Object as FabricObject,
	IText,
	util
} from 'fabric';

/**
 * The text brush.
 * @since 1.0.0
 * @class
 * @augments fabric.BaseBrush
 * @mixes fabric.Object
 */

export default util.createClass(BaseBrush, /** @lends TextBrush.prototype */{
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
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 * @param {object} canvas
	 */

	initialize(canvas){
		this.canvas = canvas;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access protected
	 */

	onMouseDown(){},

	/**
	 *
	 * @since 1.0.0
	 * @access protected
	 */

	onMouseMove(){},

	/**
	 *
	 * @since 1.0.0
	 * @param {object} options
	 */

	onMouseUp(options){
		const {
			x,
			y
		} = options.pointer;
		this.canvas
		.add(new IText('text', {
			left:x,
			top:y,
			stroke:this.color,
			strokeWidth:this.width,
			fill:this.fill
		}));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access protected
	 */

	_render(){}

});
