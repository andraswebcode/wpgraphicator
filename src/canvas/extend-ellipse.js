import {
	Ellipse,
	util
} from 'fabric';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(Ellipse.prototype, {
	/**
	 * Extend fabric.Ellipse.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['rx', 'ry']),
	/**
	 * Extend fabric.Ellipse.prototype._toSVG()
	 * @since 1.4.0
	 */
	_toSVG(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		return [
			'<ellipse ', 'COMMON_PARTS',
			'cx="' + x + '" cy="' + y + '" ',
			'rx="', this.rx,
			'" ry="', this.ry,
			'" />\n'
		];
	}
});
