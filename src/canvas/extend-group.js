import {
	Group,
	util
} from 'fabric';
import {
	each
} from 'underscore';

util.object.extend(Group.prototype, {
	/**
	 * Extend fabric.Group.prototype._toSVG()
	 * @since 1.0.0
	 */
	_toSVG(reviver){
		const svgString = [];
		each(this._objects, o => svgString.push('\t\t', o.toSVG(reviver)));
		return svgString;
	}
});
