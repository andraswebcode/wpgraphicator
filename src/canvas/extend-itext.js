import {
	IText,
	Text,
	Object as FabricObject,
	util,
	parseAttributes
} from 'fabric';

import {
	TEXT_CURSOR_COLOR
} from './../utils/constants.js';
import {
	toFixed,
	stateProperties
} from './../utils/utils.js';

const {
	escapeXml
} = util.string;

util.object.extend(IText.prototype, {
	lineHeight:1,
	cursorColor:TEXT_CURSOR_COLOR,
	/**
	 * Extend fabric.IText.prototype.toSVG()
	 * @since 1.0.0
	 */
	toSVG(reviver){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		const additionalTransform = `translate(${toFixed(x)} ${toFixed(y)})`;
		return this._createBaseSVGMarkup(this._toSVG(), {
			reviver,
			noStyle:true,
			withShadow:true,
			additionalTransform
		});
	},
	/**
	 * Extend fabric.IText.prototype._wrapSVGTextAndBg()
	 * @since 1.0.0
	 */
	_wrapSVGTextAndBg(textAndBg){
		const textDecoration = this.getSvgTextDecoration(this);
		const textAnchor = (this.textAlign === 'center') ? 'middle' : (this.textAlign === 'right') ? 'end' : '';
		return [
			textAndBg.textBgRects.join(''),
			'<text xml:space="preserve" ',
			'COMMON_PARTS',
			(this.fontFamily ? `font-family="${this.fontFamily.replace(/"/g, '\'')}" ` : ''),
			(this.fontSize ? `font-size="${this.fontSize}" ` : ''),
			(this.fontStyle ? `font-style="${this.fontStyle}" ` : ''),
			(this.fontWeight ? `font-weight="${this.fontWeight}" ` : ''),
			(textDecoration ? `text-decoration="${textDecoration}" ` : ''),
			(textAnchor ? `text-anchor="${textAnchor}"` : ''),
			'>',
			textAndBg.textSpans.join(''),
			'</text>\n'
		];
	},
	/**
	 * Extend fabric.IText.prototype._createTextCharSpan()
	 * @since 1.0.0
	 */
	_createTextCharSpan(_char, styleDecl, left, top){
		return [
			'<tspan ',
			'x="0" ',
			'dy="1em" ',
			'>',
			escapeXml(_char),
			'</tspan>'
		].join('');
	},
	/**
	 * Extend fabric.Text.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat([
		'fontFamily',
		'fontWeight',
		'fontSize',
		'text',
		'underline',
		'overline',
		'linethrough',
		'textAlign',
		'fontStyle',
		'lineHeight',
		'textBackgroundColor',
		'charSpacing',
		'styles',
		'path'
	])
});
