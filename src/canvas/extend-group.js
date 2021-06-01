import {
	Group,
	util
} from 'fabric';
import {
	each,
	isUndefined
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
	},
	/**
	 * Extend fabric.Group.prototype._createBaseSVGMarkup()
	 * @since 1.1.0
	 */
	_createBaseSVGMarkup(objectMarkup, options = {}){
		const {
			reviver
		} = options;
		const markup = [
			'<g ',
			this.getSvgTransform(false),
			this.getSvgCommons(),
			' data-group="true" ',
			this.getSvgStyleAttrs(),
			'>\n',
			objectMarkup.join(''),
			'</g>\n'
		];
		return reviver ? reviver(markup.join('')) : markup.join('');
	},
	getSvgStyleAttrs(){
		const opacity = !isUndefined(this.opacity) ? this.opacity : '1';
		return `opacity="${opacity}" `;
	}
});
