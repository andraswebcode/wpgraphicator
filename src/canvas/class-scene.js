import {
	Canvas,
	util
} from 'fabric';
import {
	findWhere
} from 'underscore';

import {
	separateColorOpacity
} from './../utils/utils.js';
import {
	TARGET_FIND_TOLERANCE,
	SELECTION_COLOR,
	SELECTION_BORDER_COLOR
} from './../utils/constants.js';

/**
 * The scene class.
 * @since 1.0.0
 * @class
 * @extends fabric.Canvas
 */

export default util.createClass(Canvas, /** @lends Scene.prototype */{

	/**
	 * Multiselection.
	 * @since 1.0.0
	 * @var {boolean}
	 */

	selection:true,

	/**
	 *
	 * @since 1.1.0
	 * @var {string}
	 */

	selectionKey:'ctrlKey',

	/**
	 *
	 * @since 1.2.0
	 * @var {string}
	 */

	uniScaleKey:'ctrlKey',

	/**
	 *
	 * @since 1.1.0
	 * @var {null}
	 */

	altActionKey:null,

	/**
	 * Save state of objects for undo/redo.
	 * @since 1.0.0
	 * @var {boolean}
	 */

	stateful:true,

	/**
	 * Disable object stacking on select.
	 * @since 1.0.0
	 * @var {boolean}
	 */

	preserveObjectStacking:true,

	/**
	 *
	 * @since 1.0.0
	 * @var {boolean}
	 */

	skipOffscreen:false,

	/**
	 * Set it to true to also render controls
	 * if there are outside the canvas.
	 * @since 1.4.0
	 * @var {boolean}
	 */

	controlsAboveOverlay:true,

	/**
	 *
	 * @since 1.0.0
	 * @var {float|int}
	 */

	targetFindTolerance:TARGET_FIND_TOLERANCE,

	/**
	 *
	 * @since 1.1.0
	 * @var {string}
	 */

	selectionColor:SELECTION_COLOR,

	/**
	 *
	 * @since 1.1.0
	 * @var {string}
	 */

	selectionBorderColor:SELECTION_BORDER_COLOR,

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 * @param {HTMLCanvasElement|string} el
	 * @param {object} options
	 */

	initialize(el, options){
		this.callSuper('initialize', el, options);
		this.wrapperEl.tabIndex = 0;
	},

	/**
	 * Get fabric object by its id.
	 * @since 1.0.0
	 * @param {string} id
	 * @return {object|undefined}
	 */

	getObjectById(id = ''){
		if (!id){
			return;
		}
		return findWhere(this._objects, {
			id
		});
	},

	/**
	 * Extend fabric.Canvas.prototype._setSVGHeader().
	 * @since 1.0.0
	 * @param {array} markup
	 * @param {object} options
	 */

	_setSVGHeader(markup = [], options = {}){
		const {
			width = 0,
			height = 0,
			backgroundColor,
			//projectName,
			//projectDescription
		} = options;
		const bgOpacity = separateColorOpacity('bg', backgroundColor || '')['bg-opacity'];
		const style = (backgroundColor && bgOpacity !== 0) ? `style="background-color:${backgroundColor};" ` : '';
		const fontFaces = this.createSVGFontFacesMarkup();
		const refElements = this.createSVGRefElementsMarkup();
		const clipPath = this.createSVGClipPathMarkup(options);
		markup.push(
			'<svg ',
			'xmlns="http://www.w3.org/2000/svg" ',
			'xmlns:xlink="http://www.w3.org/1999/xlink" ',
			'role="img" ',
			`viewBox="0 0 ${width} ${height}" `,
			style,
			'xml:space="preserve">\n',
			//projectName ? `<title>${projectName}</title>` : '',
			//projectDescription ? `<desc>${projectDescription}</desc>\n` : '',
		);
		if (fontFaces || refElements || clipPath){
			markup.push(
				'<defs>\n',
				fontFaces,
				refElements,
				clipPath,
				'</defs>\n'
			);
		}
	},

	/**
	 * Extend fabric.Canvas.prototype.createSVGFontFacesMarkup().
	 * @since 1.5.0
	 * @return {string}
	 */

	createSVGFontFacesMarkup(){
		return '';
	},

	/**
	 * Extend fabric.Canvas.prototype.createSVGRefElementsMarkup().
	 * @since 1.5.0
	 * @return {string}
	 */

	createSVGRefElementsMarkup(){
		return '';
	},

	/**
	 * Extend fabric.Canvas.prototype.createSVGClipPathMarkup().
	 * @since 1.5.0
	 * @param {object} options
	 * @return {string}
	 */

	createSVGClipPathMarkup(options){
		return '';
	}

});
