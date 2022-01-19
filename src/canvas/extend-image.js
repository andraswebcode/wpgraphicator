import {
	Image as FabricImage,
	Object as FabricObject,
	util
} from 'fabric';
import {
	isUndefined
} from 'underscore';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(FabricImage.prototype, {
	stroke:null,
	getSvgCommons(){
		return [
			FabricObject.prototype.getSvgCommons.call(this), ' ',
			this.wpId ? `data-wpid="${this.wpId}" ` : '',
			this.wpSize ? `data-wpsize="${this.wpSize}"` : ''
		].join('');
	},
	getSvgStyleAttrs(){
		const opacity = !isUndefined(this.opacity) ? this.opacity : '1';
		return `opacity="${opacity}"`;
	},
	/**
	 * Extend fabric.Image.prototype._toSVG()
	 * @since 1.0.0
	 */
	_toSVG(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		const element = this._element;
		return [
			'\t<image ',
			'COMMON_PARTS',
			'xlink:href="', this.getSvgSrc(true),
			'" x="', x, '" y="', y,
			'" width="', element.width || element.naturalWidth,
			'" height="', element.height || element.height,
			'"/>\n'
		];
	},
	/**
	 * Extend fabric.Image.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['cropX', 'cropY'])
});
