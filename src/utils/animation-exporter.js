import $ from 'jquery';
import {
	util
} from 'fabric';
import {
	each,
	contains,
	min,
	max,
	map,
	findWhere,
	find as _find,
	clone,
	isEmpty,
	isArray
} from 'underscore';

import {
	separateColorOpacity,
	svgShapes,
	parseGradient
} from './../../src-frontend/utils/utils.js';

import {
	animatables
} from './utils.js';

const {
	qrDecompose,
	composeMatrix
} = util;

/**
 *
 * @since 1.3.0
 * @var {array}
 */

const _transformProps = [
	'left',
	'top',
	'scaleX',
	'scaleY',
	'skewX',
	'skewY',
	'angle'
];

/**
 *
 * @since 1.3.0
 * @var {object}
 */

const _cssProps = {
	path:'d',
	points:'points',
	stroke:'stroke',
	strokeWidth:'stroke-width',
	strokeDashArray:'stroke-dasharray',
	strokeDashOffset:'stroke-dashoffset',
	fill:'fill',
	opacity:'opacity',
	radius:'r',
	rx:'rx',
	ry:'ry',
	width:'width',
	height:'height',
	fontSize:'font-size'
};

/**
 *
 * @since 1.3.0
 * @var {object}
 */

const _cssEasingFns = {
	linear:'linear',
	// Quad
	easeInQuad:'cubic-bezier(0.11, 0, 0.5, 0)',
	easeOutQuad:'cubic-bezier(0.5, 1, 0.89, 1)',
	easeInOutQuad:'cubic-bezier(0.45, 0, 0.55, 1)',
	easeOutInQuad:'cubic-bezier(0, 0.45, 1, 0.55)',
	// Cubic
	easeInCubic:'cubic-bezier(0.32, 0, 0.67, 0)',
	easeOutCubic:'cubic-bezier(0.33, 1, 0.68, 1)',
	easeInOutCubic:'cubic-bezier(0.65, 0, 0.35, 1)',
	easeOutInCubic:'cubic-bezier(0, 0.65, 1, 0.35)',
	// Quart
	easeInQuart:'cubic-bezier(0.5, 0, 0.75, 0)',
	easeOutQuart:'cubic-bezier(0.25, 1, 0.5, ',
	easeInOutQuart:'cubic-bezier(0.76, 0, 0.24, 1)',
	easeOutInQuart:'cubic-bezier(0, 0.76, 1, 0.24)',
	// Quint
	easeInQuint:'cubic-bezier(0.64, 0, 0.78, 0)',
	easeOutQuint:'cubic-bezier(0.22, 1, 0.36, 1)',
	easeInOutQuint:'cubic-bezier(0.83, 0, 0.17, 1)',
	easeOutInQuint:'cubic-bezier(0, 0.83, 1, 0.17)',
	// Sine
	easeInSine:'cubic-bezier(0.12, 0, 0.39, 0)',
	easeOutSine:'cubic-bezier(0.61, 1, 0.88, 1)',
	easeInOutSine:'cubic-bezier(0.37, 0, 0.63, 1)',
	easeOutInSine:'cubic-bezier(0, 0.37, 1, 0.63)',
	// Expo
	easeInExpo:'cubic-bezier(0.7, 0, 0.84, 0)',
	easeOutExpo:'cubic-bezier(0.16, 1, 0.3, 1)',
	easeInOutExpo:'cubic-bezier(0.87, 0, 0.13, 1)',
	easeOutInExpo:'cubic-bezier(0, 0.87, 1, 0.13)',
	// Circ
	easeInCirc:'cubic-bezier(0.55, 0, 1, 0.45)',
	easeOutCirc:'cubic-bezier(0, 0.55, 0.45, 1)',
	easeInOutCirc:'cubic-bezier(0.85, 0, 0.15, 1)',
	easeOutInCirc:'cubic-bezier(0, 0.85, 1, 0.15)',
	// Back
	easeInBack:'',
	easeOutBack:'',
	easeInOutBack:'',
	easeOutInBack:'',
	// Bounce
	easeInBounce:'',
	easeOutBounce:'',
	easeInOutBounce:'',
	easeOutInBounce:'',
	// Elastic
	easeInElastic:'',
	easeOutElastic:'',
	easeInOutElastic:'',
	easeOutInElastic:''
};

/**
 *
 * @since 1.3.0
 * @param {string} value
 * @return {boolean}
 */

const _isGradient = (value = '') => (('' + value).indexOf('GRADIENT') === 0);

/**
 *
 * @since 1.4.0
 * @param {string} type
 * @param {string} origin
 * @param {string} orientation
 * @param {number} value
 * @return {number}
 */

const _calcTransformByOrigin = (type, origin = 'center center', orientation = 'x', value = 0) => {
	const [
		originX,
		originY
	] = (origin || 'center center').split(' ');
	const o = parseFloat(orientation === 'x' ? originX : originY) || 0;
	const strokeWidth = 0;
	const s2 = 0;
	let xy = 0;
	switch (type){
		case 'ellipse':
		if (orientation === 'x'){
			if (originX === 'left'){
				xy = s2 + (value / 2);
			} else if (originX === 'right'){
				xy = - (value / 2) - s2;
			} else if (originX === 'center'){
				xy = 0;
			} else {
				xy = - (o * (value + strokeWidth) - (value + strokeWidth) / 2);
			}
		} else {
			if (originY === 'top'){
				xy = s2 + (value / 2);
			} else if (originY === 'bottom'){
				xy = - (value / 2) - s2;
			} else if (originY === 'center'){
				xy = 0;
			} else {
				xy = - (o * (value + strokeWidth) - (value + strokeWidth) / 2);
			}
		}
		break;
		case 'circle':
		if (orientation === 'x'){
			if (originX === 'left'){
				xy = s2 + value;
			} else if (originX === 'right'){
				xy = - value - s2;
			} else if (originX === 'center'){
				xy = 0;
			} else {
				xy = - (o * (value * 2 + strokeWidth) - (value * 2 + strokeWidth) / 2);;
			}
		} else {
			if (originY === 'top'){
				xy = s2 + value;
			} else if (originY === 'bottom'){
				xy = - value - s2;
			} else if (originY === 'center'){
				xy = 0;
			} else {
				xy = - (o * (value * 2 + strokeWidth) - (value * 2 + strokeWidth) / 2);
			}
		}
		break;
		default:
		if (orientation === 'x'){
			if (originX === 'left'){
				xy = s2;
			} else if (originX === 'right'){
				xy = - s2 - value;
			} else if (originX === 'center'){
				xy = - (value / 2);
			} else {
				xy = - (o * value) + s2 - strokeWidth * o;
			}
		} else {
			if (originY === 'top'){
				xy = s2;
			} else if (originY === 'bottom'){
				xy = - s2 - value;
			} else if (originY === 'center'){
				xy = - (value / 2);
			} else {
				xy = - (o * value) + s2 - strokeWidth * o;
			}
		}
		break;
	}
	return xy;
};

/**
 *
 * @since 1.3.0
 * @param {string} SVG string without animation.
 * @param {array} animations
 * @param {object} options
 * @return {string} SVG string with animation.
 */

export const getSVGStringWithCSSAnimation = (svgString = '', animations = [], options = {}) => {

	if (!svgString){
		return '';
	}

	svgString = svgString.replace(/(WPG_GRADIENT_ID)/g, 'wpgraphicator-gradient');

	const {
		preserveAspectRatio,
		repeat,
		totalDuration,
		version
	} = options;
	const $svg = $(svgString);

	if (preserveAspectRatio){
		$svg.attr('preserveAspectRatio', preserveAspectRatio);
	}

	$svg.find('g').each((i, g) => {
		$(g).removeAttr('data-transform data-top data-left data-scalex data-scaley data-skewx data-skewy data-angle data-originx data-originy');
		if ($(g).data('group')){
			$(g).removeAttr('data-group');
			$(g).removeAttr('opacity');
		}
	});

	if (!animations.length){
		return $svg.prop('outerHTML');
	}

	const $style = $('<style>', {
		type:'text/css'
	});
	const transformKeyframes = {};
	const keyframes = {};
	const gradientKeyframes = {};
	const generatorText = '<!-- Generator: WPGraphicator version: ' + version + ' -->';
	let css = '';

	each(animations, ({
		id,
		type,
		origin,
		start,
		duration,
		properties
	}) => {
		// If we animate polyline, or polygon points, we must replace it to path,
		// because css doesn't seem to support points attribute animation.
		let replacedToPath = false;
		if ((type === 'polyline' || type === 'polygon') && !!_find(properties, {id:'points'})){
			replacedToPath = true;
			const $el = $svg.find('.' + id);
			const $poly = $el.find('polyline, polygon');
			const points = $poly.attr('points') || '';
			const d = 'M ' + points.replace(' ', ' L ').replace(/\,/g, ' ') + (type === 'polygon' ? ' Z' : '');
			$poly.removeAttr('points');
			const html = $el.html().replace(/polygon|polyline/i, 'path');
			$el.html(html);
			$el.find('path').attr('d', d);
		}
		css += `
			.${id} ${type === 'group' ? '' : type === 'i-text' ? 'text' : replacedToPath ? 'path' : type} {
				animation-name: ${id};
				animation-delay: 0s;
				animation-duration: ${totalDuration}s;
				animation-iteration-count: ${repeat === 'infinity' ? 'infinite' : repeat};
				animation-fill-mode: both;
			}
		`;
		transformKeyframes[id] = {};
		keyframes[id] = {};
		gradientKeyframes[id] = {};
		each(properties, property => {
			const transitions = property.transitions;
			const propId = property.id;
			const minTr = min(transitions, 'second');
			const maxTr = max(transitions, 'second');
			if (!keyframes[id][0]){
				keyframes[id][0] = [];
			}
			if (contains(_transformProps, propId) && !transformKeyframes[id][propId]){
				transformKeyframes[id][propId] = {};
			}
			if (contains(_transformProps, minTr.property)){
				if (!transformKeyframes[id][propId][0]){
					transformKeyframes[id][propId][0] = [];
				}
				transformKeyframes[id][propId][0].push({
					property:minTr.property,
					easing:minTr.easing,
					second:0,
					value:minTr.value,
					start,
					duration
				});
			} else if (_isGradient(minTr.value)){
				if (!gradientKeyframes[id][propId]){
					gradientKeyframes[id][propId] = {};
				}
				const stops = parseGradient(minTr.value)?.colorStops || [];
				each(stops, (stop, i) => {
					if (!gradientKeyframes[id][propId][`stop_${i}`]){
						gradientKeyframes[id][propId][`stop_${i}`] = {};
					}
					if (!gradientKeyframes[id][propId][`stop_${i}`][0]){
						gradientKeyframes[id][propId][`stop_${i}`][0] = []
					}
					gradientKeyframes[id][propId][`stop_${i}`][0].push({
						property:minTr.property,
						easing:minTr.easing,
						second:0,
						value:stop,
						start,
						duration
					});
				});
			} else {
				keyframes[id][0].push({
					property:minTr.property,
					easing:minTr.easing,
					second:0,
					value:minTr.value,
					origin,
					start,
					duration,
					type
				});
			}
			each(transitions, ({
				property,
				easing,
				second,
				value
			}) => {
				if (contains(_transformProps, property)){
					if (!transformKeyframes[id][propId][second]){
						transformKeyframes[id][propId][second] = [];
					}
					transformKeyframes[id][property][second].push({
						property,
						easing,
						second,
						value,
						start,
						duration
					});
				} else if (_isGradient(value)){
					if (!gradientKeyframes[id][propId]){
						gradientKeyframes[id][propId] = {};
					}
					const stops = parseGradient(value)?.colorStops || [];
					each(stops, (stop, i) => {
						if (!gradientKeyframes[id][propId][`stop_${i}`]){
							gradientKeyframes[id][propId][`stop_${i}`] = {};
						}
						if (!gradientKeyframes[id][propId][`stop_${i}`][second]){
							gradientKeyframes[id][propId][`stop_${i}`][second] = []
						}
						gradientKeyframes[id][propId][`stop_${i}`][second].push({
							property,
							easing,
							second,
							value:stop,
							start,
							duration
						});
					});
				} else {
					if (!keyframes[id][second]){
						keyframes[id][second] = [];
					}
					keyframes[id][second].push({
						property,
						easing,
						second,
						value,
						origin,
						start,
						duration,
						type
					});
				}
			});
			if (!keyframes[id][totalDuration]){
				keyframes[id][totalDuration] = [];
			}
			if (contains(_transformProps, maxTr.property)){
				if (!transformKeyframes[id][propId][totalDuration]){
					transformKeyframes[id][propId][totalDuration] = [];
				}
				transformKeyframes[id][propId][totalDuration].push({
					property:maxTr.property,
					easing:maxTr.easing,
					second:totalDuration,
					value:maxTr.value,
					start,
					duration
				});
			} else if (_isGradient(maxTr.value)){
				if (!gradientKeyframes[id][propId]){
					gradientKeyframes[id][propId] = {};
				}
				const stops = parseGradient(maxTr.value)?.colorStops || [];
				each(stops, (stop, i) => {
					if (!gradientKeyframes[id][propId][`stop_${i}`]){
						gradientKeyframes[id][propId][`stop_${i}`] = {};
					}
					if (!gradientKeyframes[id][propId][`stop_${i}`][totalDuration]){
						gradientKeyframes[id][propId][`stop_${i}`][totalDuration] = []
					}
					gradientKeyframes[id][propId][`stop_${i}`][totalDuration].push({
						property:maxTr.property,
						easing:maxTr.easing,
						second:totalDuration,
						value:stop,
						start,
						duration
					});
				});
			} else {
				keyframes[id][totalDuration].push({
					property:maxTr.property,
					easing:maxTr.easing,
					second:totalDuration,
					value:maxTr.value,
					origin,
					start,
					duration,
					type
				});
			}
		});
	});
	each(transformKeyframes, (prop, id) => {
		const element = $svg.find('.' + id);
		const matrix = (element.attr('transform') || '')
			.replace('matrix(', '')
			.replace(')', '')
			.split(' ')
			.map(n => parseFloat(n) || 0);
		const defTr = qrDecompose(matrix);
		element.removeAttr('transform');
		element.wrap(`
			<g class=${id}-top style="transform:translateY(${defTr.translateY}px)">
				<g class=${id}-left style="transform:translateX(${defTr.translateX}px)">
					<g class=${id}-angle style="transform:rotate(${defTr.angle}deg)">
						<g class=${id}-scaleY style="transform:scaleY(${defTr.scaleY})">
							<g class=${id}-scaleX style="transform:scaleX(${defTr.scaleX})">
								<g class=${id}-skewY style="transform:skewY(${defTr.skewY}deg)">
									<g class=${id}-skewX style="transform:skewX(${defTr.skewX}deg)"></g>
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
		`);
		each(prop, (kf, n) => {
			css += `
				.${id}-${n} {
					animation-name: ${id}-${n};
					animation-delay: 0s;
					animation-duration: ${totalDuration}s;
					animation-iteration-count: ${repeat === 'infinity' ? 'infinite' : repeat};
					animation-fill-mode: both;
				}
			`;
			css += `@keyframes ${id}-${n} {\n`;
			each(kf, (k, sec) => {
				const prc = (sec / totalDuration * 100) || 0;
				const name = n === 'top' ? 'translateY' :
					n === 'left' ? 'translateX' :
					n === 'angle' ? 'rotate' : n;
				const unit = (n === 'top' || n === 'left') ? 'px' : (n === 'angle' || n === 'skewX' || n === 'skewY') ? 'deg' : '';
				css += `${prc}% {
					animation-timing-function: ${_cssEasingFns[k[0]?.easing] || 'linear'};
					transform: ${name}(${k[0].value}${unit});
				}`;
			});
			css += '}\n';
		});
	});
	each(keyframes, (kf, id) => {
		css += '@keyframes ' + id + '{\n';
		each(kf, (k, sec) => {
			const prc = (sec / totalDuration * 100) || 0;
			css += `${prc}% {\n`;
			each(k, c => {
				css += `animation-timing-function:${_cssEasingFns[c.easing]};`;
				if (c.property === 'stroke' || c.property === 'fill'){
					const co = separateColorOpacity(c.property, c.value);
					css += `${c.property}:${co[c.property]};${c.property}-opacity:${co[c.property + '-opacity']};\n`;
				} else if (c.property === 'path'){
					css += `d:path("${c.value}");\n`;
				} else if (c.property === 'points'){
					// If we animate polyline, or polygon points, we must replace it to path,
					// because css doesn't seem to support points attribute animation.
					const newValue = 'M ' + (c.value || '').replace(' ', ' L ').replace(/\,/g, ' ');
					css += `d:path("${newValue}");\n`;
				} else {
					const unit = (c.property === 'fontSize' || c.property === 'width' || c.property === 'height') ? 'px' : '';
					css += `${_cssProps[c.property]}:${c.value}${unit};\n`;
					if (c.type === 'rect'){
						if (c.property === 'width'){
							const x = _calcTransformByOrigin('rect', c.origin, 'x', c.value);
							css += `x: ${x}px;`
						} else if (c.property === 'height'){
							const y = _calcTransformByOrigin('rect', c.origin, 'y', c.value);
							css += `y: ${y}px;`
						}
					} else if (c.type === 'ellipse'){
						if (c.property === 'width'){
							const x = _calcTransformByOrigin('ellipse', c.origin, 'x', c.value);
							css += `rx: ${c.value / 2}px; cx: ${x}px;`;
						} else if (c.property === 'height'){
							const y = _calcTransformByOrigin('ellipse', c.origin, 'y', c.value);
							css += `ry: ${c.value / 2}px; cy: ${y}px;`;
						}
					} else if (c.type === 'circle'){
						if (c.property === 'radius'){
							const x = _calcTransformByOrigin('circle', c.origin, 'x', c.value);
							const y = _calcTransformByOrigin('circle', c.origin, 'y', c.value);
							css += `cx: ${x}px; cy: ${y}px;`;
						}
					}
				}
			});
			css += '}\n'
		});
		css += '}\n'
	});
	each(gradientKeyframes, (prop, id) => {
		const element = $svg.find('.' + id).find(svgShapes);
		if (prop.stroke){
			const strokeGrId = (element.attr('stroke') || '').replace('url(#', '').replace(')', '');
			each(prop.stroke, (kf, stop) => {
				const nth = parseInt(stop.replace('stop_', '')) + 1;
				css += `#${strokeGrId} stop:nth-child(${nth}){
					animation-name: ${strokeGrId}-${stop};
					animation-delay: 0s;
					animation-duration: ${totalDuration}s;
					animation-iteration-count: ${repeat === 'infinity' ? 'infinite' : repeat};
					animation-fill-mode: both;
				}
				@keyframes ${strokeGrId}-${stop}{`;
				each(kf, (k, sec) => {
					const prc = (sec / totalDuration * 100) || 0;
					const {
						color,
						offset
					} = k[0].value || {};
					const _color = separateColorOpacity('stroke', color);
					css += `${prc}%{
						animation-timing-function: ${_cssEasingFns[k[0]?.easing] || 'linear'};
						stop-color: ${_color['stroke']};
						stop-opacity: ${_color['stroke-opacity']}
					}`;
				});
				css += '}';
			});
		}
		if (prop.fill){
			const fillGrId = (element.attr('fill') || '').replace('url(#', '').replace(')', '');
			each(prop.fill, (kf, stop) => {
				const nth = parseInt(stop.replace('stop_', '')) + 1;
				css += `#${fillGrId} stop:nth-child(${nth}){
					animation-name: ${fillGrId}-${stop};
					animation-delay: 0s;
					animation-duration: ${totalDuration}s;
					animation-iteration-count: ${repeat === 'infinity' ? 'infinite' : repeat};
					animation-fill-mode: both;
				}
				@keyframes ${fillGrId}-${stop}{`;
				each(kf, (k, sec) => {
					const prc = (sec / totalDuration * 100) || 0;
					const {
						color,
						offset
					} = k[0].value || {};
					const _color = separateColorOpacity('fill', color);
					css += `${prc}%{
						animation-timing-function: ${_cssEasingFns[k[0]?.easing] || 'linear'};
						stop-color: ${_color['fill']};
						stop-opacity: ${_color['fill-opacity']}
					}`;
				});
				css += '}';
			});
		}
	});

	$style.text(css).prependTo($svg);
	$(generatorText).prependTo($svg);

	return $svg.prop('outerHTML').replace(/[\n\t]*/g, '');

};

/**
 *
 * @since 1.3.0
 * @param {string} SVG string without animation.
 * @param {array} animations
 * @param {object} options
 * @return {string} SVG string with animation.
 */

export const getSVGStringWithSMILAnimation = (svgString = '', animations = [], options = {}) => {

	if (!svgString){
		return '';
	}

	svgString = svgString.replace(/(WPG_GRADIENT_ID)/g, 'wpgraphicator-gradient');

	const {
		preserveAspectRatio,
		repeat = 1,
		totalDuration = 0,
		version
	} = options;
	const $svg = $(svgString);
	const generatorText = '<!-- Generator: WPGraphicator version: ' + version + ' -->';

	if (preserveAspectRatio){
		$svg.attr('preserveAspectRatio', preserveAspectRatio);
	}

	$svg.find('g').each((i, g) => {
		$(g).removeAttr('data-transform data-top data-left data-scalex data-scaley data-skewx data-skewy data-angle data-originx data-originy');
		if ($(g).data('group')){
			$(g).removeAttr('data-group');
			$(g).removeAttr('opacity');
		}
	});

	if (!animations.length){
		return $svg.prop('outerHTML');
	}

	each(animations, ({
		id,
		type,
		origin,
		start,
		duration,
		properties
	}) => {

		const element = $svg.find('.' + id);
		const matrix = ($svg.find('.' + id).attr('transform') || '')
			.replace('matrix(', '')
			.replace(')', '')
			.split(' ')
			.map(n => parseFloat(n) || 0);
		const defTr = qrDecompose(matrix);
		element.removeAttr('transform');
		const scX = findWhere(properties, {id:'scaleX'}) && findWhere(properties, {id:'scaleY'}) ? 1 : defTr.scaleX;
		const scY = findWhere(properties, {id:'scaleX'}) && findWhere(properties, {id:'scaleY'}) ? 1 : defTr.scaleY;
		element.wrap(`
			<g class=${id}-top transform="translate(0 ${defTr.translateY})">
				<g class=${id}-left transform="translate(${defTr.translateX} 0)">
					<g class=${id}-angle transform="rotate(${defTr.angle})">
						<g class=${id}-scaleY transform="scale(1 ${scX})">
							<g class=${id}-scaleX transform="scale(${scY} 1)">
								<g class=${id}-skewY transform="skewY(${defTr.skewY})">
									<g class=${id}-skewX transform="skewX(${defTr.skewX})"></g>
								</g>
							</g>
						</g>
					</g>
				</g>
			</g>
		`);

		each(properties, property => {
			const minTr = min(property.transitions, 'second');
			const maxTr = max(property.transitions, 'second');
			if (minTr?.second !== 0){
				const newTr = clone(minTr);
				newTr.second = 0;
				property.transitions.unshift(newTr);
			}
			if (maxTr?.second !== totalDuration){
				const newTr = clone(maxTr);
				newTr.second = totalDuration;
				property.transitions.push(newTr);
			}
			if (contains(_transformProps, property.id)){
				const prop = property.id;
				const atrType = (prop === 'left' || prop === 'top') ? 'translate' :
					(prop === 'scaleX' || prop === 'scaleY') ? 'scale' :
					(prop === 'angle') ? 'rotate' : prop;
				const values = property.transitions.map(tr => {
					const v = tr.value;
					switch (tr.property){
						case 'left':
						return `${v - matrix[4]} 0`;
						case 'top':
						return `0 ${v - matrix[5]}`;
						case 'scaleX':
						return `${v} 1`;
						case 'scaleY':
						return `1 ${v}`;
						case 'skewX':
						return v;
						case 'skewY':
						return v;
						case 'angle':
						return `${v}`;
						default:
						return '';
					}
				}).join(';');
				const keyTimes = property.transitions.map(tr => tr.second / totalDuration).join(';');
				const keySplines = property.transitions.map(({easing}) => {
					const bezier = (_cssEasingFns[easing] || '')
						.replace('cubic-bezier(', '')
						.replace(')', '')
						.replace(/\,/g, '');
					return (easing === 'linear' || !_cssEasingFns[easing]) ? '0 0 1 1' : bezier;
				});
				keySplines.shift();
				const animateTransform = $('<animateTransform>', {
					attributeName:'transform',
					attributeType:'XML',
					type:atrType,
					repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
					dur:`${totalDuration}s`,
					values,
					keyTimes,
					calcMode:'spline',
					keySplines:keySplines.join(';'),
					fill:'freeze',
					additive:'sum'
				});
				animateTransform.appendTo(element.closest(`.${id}-${prop}`));
			} else if ((property.id === 'fill' || property.id === 'stroke') && _isGradient(property.transitions[0]?.value)){
				const grId = (element.find(svgShapes).attr(property.id) || '').replace('url(#', '').replace(')', '');
				const values = property.transitions.map(tr => `${(parseGradient(tr.value).angle || 0)} 0.5 0.5`).join(';');
				const keyTimes = property.transitions.map(tr => tr.second / totalDuration).join(';');
				const keySplines = property.transitions.map(({easing}) => {
					const bezier = (_cssEasingFns[easing] || '')
						.replace('cubic-bezier(', '')
						.replace(')', '')
						.replace(/\,/g, '');
					return (easing === 'linear' || !_cssEasingFns[easing]) ? '0 0 1 1' : bezier;
				});
				keySplines.shift();
				$('<animateTransform>', {
					attributeName:'gradientTransform',
					attributeType:'XML',
					type:'rotate',
					repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
					dur:`${totalDuration}s`,
					values,
					keyTimes,
					calcMode:'spline',
					keySplines:keySplines.join(';'),
					fill:'freeze'
				}).appendTo(element.find('linearGradient#' + grId));
				const cStops = {};
				each(property.transitions, (tr, i) => {
					const stops = parseGradient(tr.value)?.colorStops;
					each(stops, (stop, i) => {
						if (!cStops[`stop_${i}`]){
							cStops[`stop_${i}`] = {};
						}
						cStops[`stop_${i}`][tr.second] = stop;
					});
				});
				each(cStops, (kf, stop) => {
					const nth = parseInt(stop.replace('stop_', ''));
					const colorValues = map(kf, k => separateColorOpacity(property.id, k.color)[property.id] || '').join(';');
					const opacityValues = map(kf, k => separateColorOpacity(property.id, k.color)[property.id + '-opacity'] || 0).join(';');
					const offsetValues = map(kf, k => k.offset).join(';');
					const keyTimes = map(kf, (k, sec) => sec / totalDuration).join(';');
					const keySplines = [];
					const color = $('<animate>', {
						attributeName:'stop-color',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:colorValues,
						keyTimes,
						fill:'freeze'
					});
					const opacity = $('<animate>', {
						attributeName:'stop-opacity',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:opacityValues,
						keyTimes,
						fill:'freeze'
					});
					const offset = $('<animate>', {
						attributeName:'offset',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:offsetValues,
						keyTimes,
						fill:'freeze'
					});
					color.appendTo(element.find('#' + grId).find('stop').eq(nth));
					opacity.appendTo(element.find('#' + grId).find('stop').eq(nth));
					offset.appendTo(element.find('#' + grId).find('stop').eq(nth));
				});
			} else {
				const keyTimes = property.transitions.map(tr => tr.second / totalDuration).join(';');
				const keySplines = property.transitions.map(({easing}) => {
					const bezier = (_cssEasingFns[easing] || '')
						.replace('cubic-bezier(', '')
						.replace(')', '')
						.replace(/\,/g, '');
					return (easing === 'linear' || !_cssEasingFns[easing]) ? '0 0 1 1' : bezier;
				});
				keySplines.shift();
				if (property.id === 'fill' || property.id === 'stroke'){
					const colorValues = property.transitions
						.map(tr => separateColorOpacity(property.id, tr.value)[property.id]).join(';');
					const opacityValues = property.transitions
						.map(tr => separateColorOpacity(property.id, tr.value)[property.id + '-opacity']).join(';');
					$('<animate>', {
						attributeName:property.id,
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:colorValues,
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
					$('<animate>', {
						attributeName:property.id + '-opacity',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:opacityValues,
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				} else {
					const values = property.transitions.map(tr => tr.value).join(';');
					const animate = $('<animate>', {
						attributeName:_cssProps[property.id],
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values,
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					});
					animate.prependTo(type === 'group' ? element : element.find(type === 'i-text' ? 'text' : type));
				}
				if (type === 'rect' && property.id === 'width'){
					$('<animate>', {
						attributeName:'x',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('rect', origin, 'x', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				} else if (type === 'rect' && property.id === 'height'){
					$('<animate>', {
						attributeName:'y',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('rect', origin, 'y', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				} else if (type === 'ellipse' && property.id === 'width'){
					$('<animate>', {
						attributeName:'rx',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => tr.value / 2).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
					$('<animate>', {
						attributeName:'cx',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('ellipse', origin, 'x', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				} else if (type === 'ellipse' && property.id === 'height'){
					$('<animate>', {
						attributeName:'ry',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => tr.value / 2).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
					$('<animate>', {
						attributeName:'cy',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('ellipse', origin, 'y', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				} else if (type === 'circle' && property.id === 'radius'){
					$('<animate>', {
						attributeName:'cx',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('circle', origin, 'x', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
					$('<animate>', {
						attributeName:'cy',
						repeatCount:repeat === 'infinity' ? 'indefinite' : repeat,
						dur:totalDuration,
						values:property.transitions.map(tr => _calcTransformByOrigin('circle', origin, 'y', tr.value)).join(';'),
						keyTimes,
						calcMode:'spline',
						keySplines:keySplines.join(';'),
						fill:'freeze'
					}).prependTo(element.find(type));
				}
			}
		});

	});

	$(generatorText).prependTo($svg);

	return $svg.prop('outerHTML')
	.replace(/animatetransform/g, 'animateTransform')
	.replace(/attributename/g, 'attributeName')
	.replace(/attributetype/g, 'attributeType')
	.replace(/repeatcount/g, 'repeatCount')
	.replace(/keytimes/g, 'keyTimes')
	.replace(/calcmode/g, 'calcMode')
	.replace(/keysplines/g, 'keySplines')
	.replace(/[\n\t]*/g, '');

};
