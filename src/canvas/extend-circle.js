import {
	Circle,
	util
} from 'fabric';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(Circle.prototype, {
	/**
	 * Extend fabric.Circle.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['radius']),
	/**
	 * Extend fabric.Circle.prototype._toSVG()
	 * @since 1.4.0
	 */
	_toSVG(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		return [
			'<circle ', 'COMMON_PARTS',
			'cx="' + x + '" cy="' + y + '" ',
			'r="', this.radius,
			'" />\n'
		];
	}
});
