import $ from 'jquery';
import {
	i18n
} from 'wordpress';
import {
	Point,
	Shadow,
	Gradient,
	Color,
	util
} from 'fabric';
import {
	isNaN as _isNaN,
	isUndefined,
	each,
	pick,
	isEqual,
	isString,
	isEmpty
} from 'underscore';

import {
	FRACTION_DIGITS
} from './constants.js';

const {
	__
} = i18n;

const {
	parsePath,
	qrDecompose
} = util;

/**
 * Fabric object names.
 * @since 1.0.0
 * @var {object}
 */

export const shapeNames = {
	'rect':__('Rectangle', 'wpgraphicator'),
	'circle':__('Circle', 'wpgraphicator'),
	'ellipse':__('Ellipse', 'wpgraphicator'),
	'line':__('Line', 'wpgraphicator'),
	'path':__('Path', 'wpgraphicator'),
	'polyline':__('Polyline', 'wpgraphicator'),
	'polygon':__('Polygon', 'wpgraphicator'),
	'i-text':__('Text', 'wpgraphicator'),
	'image':__('Image', 'wpgraphicator'),
	'group':__('Group', 'wpgraphicator')
};

/**
 * Animatable property names for timeline.
 * @since 1.0.0
 * @var {object}
 */

export const propertyNames = {
	left:__('Left', 'wpgraphicator'),
	top:__('Top', 'wpgraphicator'),
	angle:__('Angle', 'wpgraphicator'),
	scaleX:__('Scale X', 'wpgraphicator'),
	scaleY:__('Scale Y', 'wpgraphicator'),
	skewX:__('Skew X', 'wpgraphicator'),
	skewY:__('Skew Y', 'wpgraphicator'),
	fill:__('Fill', 'wpgraphicator'),
	stroke:__('Stroke', 'wpgraphicator'),
	strokeWidth:__('Stroke Width', 'wpgraphicator'),
	strokeDashArray:__('Stroke Dash Array', 'wpgraphicator'),
	strokeDashOffset:__('Stroke Dash Offset', 'wpgraphicator'),
	opacity:__('Opacity', 'wpgraphicator'),
	width:__('Width', 'wpgraphicator'),
	height:__('Height', 'wpgraphicator'),
	radius:__('Radius', 'wpgraphicator'),
	x1:__('X 1', 'wpgraphicator'),
	y1:__('Y 1', 'wpgraphicator'),
	x2:__('X 2', 'wpgraphicator'),
	y2:__('Y 2', 'wpgraphicator'),
	path:__('Path', 'wpgraphicator'),
	points:__('Points', 'wpgraphicator'),
	fontSize:__('Font Size', 'wpgraphicator')
};

/**
 * Notification messages.
 * @since 1.0.0
 * @var {object}
 */

export const notificationMessages = {
	saveSuccess:__('Project Saved Successfully', 'wpgraphicator'),
	updateSuccess:__('Project Updated Successfully', 'wpgraphicator'),
	saveFailed:__('Save Failed', 'wpgraphicator'),
	changeProjectWidth:__('Are you sure you change project width?', 'wpgraphicator'),
	changeProjectHeight:__('Are you sure you change project height?', 'wpgraphicator'),
	changeProjectDuration:__('Are you sure you change max duration of timeline?', 'wpgraphicator'),
	removeShape:__('Are you sure you want to remove this item?', 'wpgraphicator'),
	removeShapes:__('Are you sure you want to remove selected items?', 'wpgraphicator'),
	removeAllShapes:__('Are you sure you want to remove all shapes from the canvas?', 'wpgraphicator'),
	removeProperty:__('Are you sure you want to remove this property from the timeline?', 'wpgraphicator'),
	removePoint:__('Are you sure you want to remove this keyframe?', 'wpgraphicator'),
	removeAllPoints:__('Are you sure you want to delete all animations from this shape?', 'wpgraphicator')
};

/**
 * List of easings.
 * @since 1.0.0
 * @var {object}
 */

export const easings = {
	linear:__('Linear', 'wpgraphicator'),
	easeInQuad:__('Quadratic In', 'wpgraphicator'),
	easeOutQuad:__('Quadratic Out', 'wpgraphicator'),
	easeInOutQuad:__('Quadratic In Out', 'wpgraphicator'),
	easeOutInQuad:__('Quadratic Out In', 'wpgraphicator'),
	easeInCubic:__('Cubic In', 'wpgraphicator'),
	easeOutCubic:__('Cubic Out', 'wpgraphicator'),
	easeInOutCubic:__('Cubic In Out', 'wpgraphicator'),
	easeOutInCubic:__('Cubic Out In', 'wpgraphicator'),
	easeInQuart:__('Quartic In', 'wpgraphicator'),
	easeOutQuart:__('Quartic Out', 'wpgraphicator'),
	easeInOutQuart:__('Quartic In Out', 'wpgraphicator'),
	easeOutInQuart:__('Quartic Out In', 'wpgraphicator'),
	easeInQuint:__('Quintic In', 'wpgraphicator'),
	easeOutQuint:__('Quintic Out', 'wpgraphicator'),
	easeInOutQuint:__('Quintic In Out', 'wpgraphicator'),
	easeOutInQuint:__('Quintic Out In', 'wpgraphicator'),
	easeInSine:__('Sine In', 'wpgraphicator'),
	easeOutSine:__('Sine Out', 'wpgraphicator'),
	easeInOutSine:__('Sine In Out', 'wpgraphicator'),
	easeOutInSine:__('Sine Out In', 'wpgraphicator'),
	easeInExpo:__('Exponential In', 'wpgraphicator'),
	easeOutExpo:__('Exponential Out', 'wpgraphicator'),
	easeInOutExpo:__('Exponential In Out', 'wpgraphicator'),
	easeOutInExpo:__('Exponential Out In', 'wpgraphicator'),
	easeInCirc:__('Circle In', 'wpgraphicator'),
	easeOutCirc:__('Circle Out', 'wpgraphicator'),
	easeInOutCirc:__('Circle In Out', 'wpgraphicator'),
	easeOutInCirc:__('Circle Out In', 'wpgraphicator'),
	easeInBack:__('Back In', 'wpgraphicator'),
	easeOutBack:__('Back Out', 'wpgraphicator'),
	easeInOutBack:__('Back In Out', 'wpgraphicator'),
	easeOutInBack:__('Back Out In', 'wpgraphicator'),
	easeInBounce:__('Bounce In', 'wpgraphicator'),
	easeOutBounce:__('Bounce Out', 'wpgraphicator'),
	easeInOutBounce:__('Bounce In Out', 'wpgraphicator'),
	easeOutInBounce:__('Bounce Out In', 'wpgraphicator'),
	easeInElastic:__('Elastic In', 'wpgraphicator'),
	easeOutElastic:__('Elastic Out', 'wpgraphicator'),
	easeInOutElastic:__('Elastic In Out', 'wpgraphicator'),
	easeOutInElastic:__('Elastic Out In', 'wpgraphicator')
};

/**
 * List of web safa fonts.
 * @since 1.0.0
 * @var {array}
 */

export const webSafeFonts = [
	"Arial",
	"Arial Black",
	"Times New Roman",
	"Courier",
	"Verdana",
	"Georgia",
	"Impact",
	"Comic Sans MS"
];

/**
 * List od animatable properties.
 * @since 1.0.0
 * @var {array}
 */

export const animatables = [
	'left',
	'top',
	'scaleX',
	'scaleY',
	'skewX',
	'skewY',
	'angle',
	'fill',
	'stroke',
	'strokeWidth',
	'strokeDashArray',
	'strokeDashOffset',
	'opacity',
	'path',
	'points',
	'fontSize',
	'width',
	'height',
	'radius',
	'x1',
	'y1',
	'x2',
	'y2'
];

/**
 * Default state properties that overwrites
 * the fabric.Object.prototype.stateProperties.
 * @since 1.0.0
 * @var {array}
 */

export const stateProperties = [
	'top',
	'left',
	'width',
	'height',
	'scaleX',
	'scaleY',
	'stroke',
	'strokeWidth',
	'strokeDashArray',
	'strokeLineCap',
	'strokeDashOffset',
	'strokeLineJoin',
	'strokeMiterLimit',
	'angle',
	'opacity',
	'fill',
	'shadow',
	'skewX',
	'skewY',
	'fillRule',
	'strokeUniform'
];

/**
 * A list of keyboard shortcuts, and descriptions.
 * @since 1.0.0
 * @var {array}
 */

export const keyboardShortcuts = [{
	title:__('Global', 'wpgraphicator'),
	shortcuts:[{
		combination:'Ctrl + S',
		description:__('Save Project as Published.', 'wpgraphicator')
	},{
		combination:'Ctrl + D',
		description:__('Save Project as Draft.', 'wpgraphicator')
	},{
		combination:'Ctrl + Z',
		description:__('Undo', 'wpgraphicator')
	},{
		combination:'Ctrl + V',
		description:__('Paste Shape, or Keyframe.', 'wpgraphicator')
	},{
		combination:'Ctrl + G',
		description:__('Turn on/Off Snap to Grid.', 'wpgraphicator')
	},{
		combination:'Space',
		description:__('Play/Pause Animation.', 'wpgraphicator')
	},{
		combination:'Esc',
		description:__('Clear Selection.', 'wpgraphicator')
	},{
		combination:'Shift + Alt + C',
		description:__('Clear Canvas.', 'wpgraphicator')
	}]
},{
	title:__('Toolbar', 'wpgraphicator'),
	shortcuts:[{
		combination:'Enter',
		description:__('Select Mode', 'wpgraphicator')
	},{
		combination:'D',
		description:__('Free Draw', 'wpgraphicator')
	},{
		combination:'R',
		description:__('Draw Square', 'wpgraphicator')
	},{
		combination:'C',
		description:__('Draw Ellipse', 'wpgraphicator')
	},{
		combination:'T',
		description:__('Add Text', 'wpgraphicator')
	},{
		combination:'P',
		description:__('Draw Path', 'wpgraphicator')
	},{
		combination:'Q',
		description:__('Draw Polyline', 'wpgraphicator')
	},{
		combination:'E',
		description:__('Edit Path', 'wpgraphicator')
	},{
		combination:'I',
		description:__('Add Image', 'wpgraphicator')
	},{
		combination:'+',
		description:__('Zoom In', 'wpgraphicator')
	},{
		combination:'-',
		description:__('Zoom Out', 'wpgraphicator')
	}]
},{
	title:__('Focus on Canvas', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Selected Shape Up.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Selected Shape Down.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Selected Shape Left.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Selected Shape Right.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Shape.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Selected Shape.', 'wpgraphicator')
	}]
},{
	title:__('Focus on a Keyframe', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Selected Keyframe Forward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Selected Keyframe Backward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Selected Keyframe Backward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Selected Keyframe Forward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'J',
		description:__('Jump Selected Keyframe to The Playhead.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Keyframe.', 'wpgraphicator')
	},{
		combination:'Space',
		description:__('Open Keyframe Settings Popup.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Selected Keyframe.', 'wpgraphicator')
	}]
},{
	title:__('Focus on Playhead', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Playhead Forward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Playhead Backward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Playhead Backward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Playhead Forward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Home',
		description:__('Move Playhead to 0 Second.', 'wpgraphicator')
	},{
		combination:'End',
		description:__('Move Playhead to The End.', 'wpgraphicator')
	}]
},{
	title:__('Drawing Shape', 'wpgraphicator'),
	shortcuts:[{
		combination:'Ctrl',
		description:__('Keep Aspect Ratio.', 'wpgraphicator')
	}]
},{
	title:__('Editing Text', 'wpgraphicator'),
	shortcuts:[{
		combination:'Up/Down/Left/Right',
		description:__('Move Cursor.', 'wpgraphicator')
	},{
		combination:'Shift + Left/Right',
		description:__('Select Character.', 'wpgraphicator')
	},{
		combination:'Shift + Up/Down',
		description:__('Select Text Vertically.', 'wpgraphicator')
	},{
		combination:'Alt + Left/Right',
		description:__('Move Cursor by Word.', 'wpgraphicator')
	},{
		combination:'Shift + Alt + Left/Right',
		description:__('Select Words.', 'wpgraphicator')
	},{
		combination:'Home',
		description:__('Move Cursor to Line Start.', 'wpgraphicator')
	},{
		combination:'End',
		description:__('Move Cursor to Line End.', 'wpgraphicator')
	},{
		combination:'Backspace',
		description:__('Delete Character Backward.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Character Forward.', 'wpgraphicator')
	},{
		combination:'Ctrl + X',
		description:__('Cut Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + V',
		description:__('Paste Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + A',
		description:__('Select All.', 'wpgraphicator')
	},{
		combination:'Tab/Esc',
		description:__('Quit Editing.', 'wpgraphicator')
	}]
}];

/**
 * Create grid pattern, and background color for scene.
 * @since 1.0.0
 * @param {float} zoom
 * @param {int} grid Size of grid.
 * @param {string} bgColor Project background color.
 * @return {object} For creating pattern.
 */

export function createSceneBackground(zoom = 1, grid = 10, bgColor = '#fff') {
	if (!createSceneBackground.cacheCanvas){
		createSceneBackground.cacheCanvas = $('<canvas />');
	}
	const canvas = createSceneBackground.cacheCanvas;
	const ctx = canvas[0].getContext('2d');
	const gridSize = grid * zoom;
	const canvasSize = 2 * gridSize;
	const scale = 1 / zoom;
	canvas.attr({
		width:canvasSize,
		height:canvasSize
	});
	// Clear canvas.
	ctx.clearRect(0, 0, canvasSize, canvasSize);
	// Draw grid.
	ctx.fillStyle = '#999999';
	ctx.fillRect(0, 0, canvasSize, canvasSize);
	ctx.fillStyle = '#666666';
	ctx.fillRect(0, 0, gridSize, gridSize);
	ctx.fillRect(gridSize, gridSize, gridSize, gridSize);
	// And finally draw bg color.
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvasSize, canvasSize);
	return {
		source:canvas[0],
		patternTransform:[scale, 0, 0, scale, 0, 0]
	};
}

/**
 *
 * @since 1.0.0
 * @param {mixed} replacement
 */

export const replaceCollidedParams = {
	strokeDashArray:replacement => replacement.split(' ').map(n => parseFloat(n)).filter(n => !_isNaN(n)),
	path:parsePath,
	points:parsePoints,
	fill:replacement => {
		if (isString(replacement) && replacement.indexOf('GRADIENT') === 0){ // In case of gradient.
			return parseGradient(replacement);
		}
		return replacement; // In case of color.
	},
	stroke:replacement => {
		if (isString(replacement) && replacement.indexOf('GRADIENT') === 0){ // In case of gradient.
			return parseGradient(replacement);
		}
		return replacement; // In case of color.
	},
	shadow:replacement => new Shadow(replacement)
};

/**
 *
 * @param {float|int} value
 * @param {float|int} min
 * @param {float|int} max
 * @return {float|int}
 * @since 1.0.0
 */

export function clamp(value = 0, min = 0, max = 1) {
	const _value = parseFloat(value) || 0;
	return Math.min(Math.max(_value, min), max);
}

/**
 *
 * @param {float|int} value
 * @param {int} fractionDigits
 * @return {float|int}
 * @since 1.0.0
 */

export function toFixed(value, fractionDigits = FRACTION_DIGITS) {
	const _value = parseFloat(value) || 0;
	return (Math.round(_value * (10 ** fractionDigits)) / (10 ** fractionDigits)) || 0;
}

/**
 * Serialize fabric path.
 * @param {array} path
 * @return {string}
 * @since 1.0.0
 */

export function serializePath(path = []) {
	return path.map(path => path.map(n => !_isNaN(parseFloat(n)) ? toFixed(n) : n).join(' ')).join(' ');
}

/**
 * Serialize fabric polyline points.
 * @param {array} points
 * @return {string}
 * @since 1.0.0
 */

export function serializePoints(points = []) {
	return points.map(({x, y}) => `${toFixed(x)},${toFixed(y)}`).join(' ');
}

/**
 * Parse points string to fabric polyline points.
 * @param {string} Svg points attribute.
 * @return {array}
 * @since 1.0.0
 */

export function parsePoints(points = '') {
	return points
	.split(' ')
	.map(p => {
		var point = p.split(',');
		return {
			x:parseFloat(point[0]),
			y:parseFloat(point[1])
		};
	})
	.filter(p => !_isNaN(p.x) && !isUndefined(p.x) && !_isNaN(p.y) && !isUndefined(p.y));
}

/**
 *
 * @param {string} prop
 * @param {string} value
 * @return {string}
 * @since 1.0.0
 */

export function separateColorOpacity(prop = 'stroke', value = '#000'){
	const output = {};
	if (value.toLive){ // In case of gradient.
		output[prop] = `url(#${value.id})`;
		output[`${prop}-opacity`] = 1;
		return output;
	}
	const isRgba = value.indexOf('rgba') >= 0;
	if (isRgba){
		const v = value.replace(/[rgba(|\)|\s]/g, '').split(',').map(toFixed);
		output[prop] = `rgb(${v[0]},${v[1]},${v[2]})`;
		output[`${prop}-opacity`] = v[3];
	} else {
		output[prop] = value;
		output[`${prop}-opacity`] = 1;
	}
	return output;
}

/**
 *
 * @since 1.0.0
 * @param {array} path Fabric path.
 * @param {integer} i Index.
 * @return {string}
 */

export function getControlPoint1(path, i) {
	if (i === 0){
		return '';
	}
	if (path[i - 1]){
		if (path[i - 1][0] === 'Q'){
			return `c${i - 1}`;
		} else if (path[i - 1][0] === 'C'){
			return `c2${i - 1}`;
		}
	}
	return '';
}

/**
 *
 * @since 1.0.0
 * @param {array} path Fabric path.
 * @param {integer} i Index.
 * @return {string}
 */

export function getControlPoint2(path, i) {
	if (!path[i + 1]){
		return '';
	}
	if (path[i + 1][0] === 'Q'){
		return `c${i + 1}`;
	} else if (path[i + 1][0] === 'C'){
		return `c1${i + 1}`;
	}
	return '';
}

/**
 *
 * @param {string} gradient Serialized gradient values.
 * @return {fabric.Gradient}
 * @since 1.1.0
 */

export function parseGradient(gradient = ''){
	if (!isString(gradient)){
		return new Gradient();
	}
	if (!parseGradient.cache){
		parseGradient.cache = {};
	}
	if (parseGradient.cache[gradient]){
		return parseGradient.cache[gradient];
	}
	const datas = gradient.split(';');
	if (datas[0] !== 'GRADIENT'){
		return new Gradient();
	}
	const type = datas[1] || 'linear';
	const angle = parseFloat(datas[2]) || 0;
	const colorStops = datas.slice(3).map(data => {
		const _data = data.split('_');
		const color = separateColorOpacity('stop', _data[0]);
		return {
			color:color['stop'],
			opacity:color['stop-opacity'],
			offset:parseFloat(_data[1])
		};
	});
	parseGradient.cache[gradient] = new Gradient({
		type,
		angle,
		colorStops
	});
	return parseGradient.cache[gradient];
}

/**
 *
 * Schema example: 'GRADIENT;linear;45;rgb(0,0,0)_0;rgba(0, 0, 0, 0.1)_1'
 * @param {fabric.Gradient|object}
 * @return {string}
 * @since 1.1.0
 */

export function serializeGradient(gradient = {}){
	if (isEmpty(gradient)){
		return '';
	}
	const type = gradient.type === 'linear' ? 'linear' : 'radial';
	const angle = gradient.angle || 0;
	const colorStops = (gradient.colorStops || [])
	.slice()
	.sort((a, b) => (a.offset - b.offset))
	.map(({color, offset, opacity}) => {
		const c = new Color(color);
		if (!isUndefined(opacity)){
			c.setAlpha(opacity);
		}
		return `${c.toRgba()}_${offset}`;
	}).join(';');
	return `GRADIENT;${type};${angle};${colorStops}`;
}

/**
 * Returns the number of shapes in an SVG string.
 * @param {string} svgString
 * @return {int}
 * @since 1.1.0
 */

export function countShapesInSVGString(svgString = ''){
	if (!svgString){
		return 0;
	}
	return svgString.match(/(\<)(path|circle|poly|ellipse|rect|line|image|text)/g)?.length || 0;
}