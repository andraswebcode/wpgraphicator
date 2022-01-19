import $ from 'jquery';
import {
	separateColorOpacity,
	parseGradient,
	rotatePoint,
	clamp
} from './utils.js';

const styleProps = {
	stroke:'stroke',
	strokeWidth:'stroke-width',
	strokeDashArray:'stroke-dasharray',
	strokeDashOffset:'stroke-dashoffset',
	fill:'fill',
	opacity:'opacity'
};

/**
 *
 * @since 1.0.0
 * @param {object} props
 * @return {object}
 */

export const getShapeStyles = props => {
	let output = {};
	$.each(styleProps, (jsVal, cssVal) => {
		if (jsVal === 'fill' || jsVal === 'stroke'){
			if (props[jsVal] && props[jsVal].indexOf('GRADIENT') !== 0){ // Do nothing here, if this is a gradient.
				$.extend(output, separateColorOpacity(jsVal, props[jsVal]));
			}
		} else {
			if (props[jsVal] !== undefined){
				output[cssVal] = props[jsVal];
			}
		}
	});
	return output;
};

/**
 *
 * @since 1.0.0
 * @param {object} props
 * @param {string} type
 * @param {string} origin
 * @param {object} shape The jQuery shape element.
 * @return {object}
 */

export const getShapeAttrs = (props = {}, type, origin = 'center center', shape) => {
	const output = {};
	const trOrigin = origin.split(' ');
	const originX = trOrigin[0];
	const originY = trOrigin[1];
	const oX = parseFloat(originX) || 0;
	const oY = parseFloat(originY) || 0;
	const strokeWidth = parseInt(shape.attr('stroke-width')) || 0;
	const s2 = strokeWidth / 2;
	switch (type){
		case 'ellipse':
		if (props.width){
			output.width = props.width;
			output.rx = props.width / 2;
			if (originX === 'left'){
				output.cx = s2 + (props.width / 2);
			} else if (originX === 'right'){
				output.cx = - (props.width / 2) - s2;
			} else if (originX === 'center'){
				output.cx = 0;
			} else {
				output.cx = - (oX * (props.width + strokeWidth) - (props.width + strokeWidth) / 2);
			}
		}
		if (props.height){
			output.height = props.height;
			output.ry = props.height / 2;
			if (originY === 'top'){
				output.cy = s2 + (props.height / 2);
			} else if (originY === 'bottom'){
				output.cy = - (props.height / 2) - s2;
			} else if (originY === 'center'){
				output.cy = 0;
			} else {
				output.cy = - (oY * (props.height + strokeWidth) - (props.height + strokeWidth) / 2);
			}console.log(oX, props.width, strokeWidth)
		}
		break;
		case 'circle':
		if (props.radius){
			output.r = props.radius;
			// Horizontal
			if (originX === 'left'){
				output.cx = s2 + props.radius;
			} else if (originX === 'right'){
				output.cx = - props.radius - s2;
			} else if (originX === 'center'){
				output.cx = 0;
			} else {
				output.cx = - (oX * (props.radius * 2 + strokeWidth) - (props.radius * 2 + strokeWidth) / 2);;
			}
			// Vertical
			if (originY === 'top'){
				output.cy = s2 + props.radius;
			} else if (originY === 'bottom'){
				output.cy = - props.radius - s2;
			} else if (originY === 'center'){
				output.cy = 0;
			} else {
				output.cy = - (oY * (props.radius * 2 + strokeWidth) - (props.radius * 2 + strokeWidth) / 2);
			}
		}
		break;
		case 'rect':
		if (props.width){
			output.width = props.width;
			if (originX === 'left'){
				output.x = s2;
			} else if (originX === 'right'){
				output.x = - s2 - props.width;
			} else if (originX === 'center'){
				output.x = - (props.width / 2);
			} else {
				output.x = - (oX * props.width) + s2 - strokeWidth * oX;;
			}
		}
		if (props.height){
			output.height = props.height;
			if (originY === 'top'){
				output.y = s2;
			} else if (originY === 'bottom'){
				output.y = - s2 - props.height;
			} else if (originY === 'center'){
				output.y = - (props.height / 2);
			} else {
				output.y = - (oY * props.height) + s2 - strokeWidth * oY;
			}
		}
		break;
		case 'line':
		if (props.x1){
			output.x1 = props.x1;
		}
		if (props.y1){
			output.y1 = props.y1;
		}
		if (props.x2){
			output.x2 = props.x2;
		}
		if (props.y2){
			output.y2 = props.y2;
		}
		break;
		case 'path':
		if (props.path){
			output.d = props.path;
		}
		break;
		case 'polyline':
		case 'polygon':
		if (props.points){
			output.points = props.points;
		}
		break;
		case 'i-text':
		if (props.fontSize){
			output['font-size'] = props.fontSize;
			if (shape.length && shape[0].getBBox){
				const align = shape.attr('text-anchor');
				const {
					width = 1,
					height = 1,
					x = 0,
					y = 0
				} = shape[0].getBBox();
				let offsetX = 0, offsetY = 0;
				// Horizontal
				if (originX === 'left'){
					offsetX = (align === 'middle') ? width / 2 : (align === 'end') ? width : 0;
				} else if (originX === 'right'){
					offsetX = (align === 'middle') ? - (width / 2) : (align === 'end') ? 0 : - width;
				} else if (originX === 'center'){
					offsetX = (align === 'middle') ? 0 : (align === 'end') ? width / 2 : - (width / 2);
				} else {
					offsetX = (align === 'middle') ? width * (0.5 - oX) : (align === 'end') ? width * (1 - oX) : - (width * oX);
				}
				// Vertical
				if (originY === 'top'){
					offsetY = 0;
				} else if (originY === 'bottom'){
					offsetY = - height;
				} else if (originY === 'center'){
					offsetY = - (height / 2);
				} else {
					offsetY = - (height * oY);
				}
				output.transform = `translate(${offsetX} ${offsetY})`;
			}
		}
		break;
		default:
		break;
	}
	return output;
};

/**
 *
 * @since 1.0.0
 * @param {jQuery} gradientElement
 * @param {string} gradientValue
 */

export const setGradient = (gradientElement, gradientValue) => {
	const {
		type,
		angle,
		colorStops
	} = parseGradient(gradientValue);
	const p1 = rotatePoint({
		x:0,
		y:0.5
	}, {
		x:0.5,
		y:0.5
	}, angle);
	const p2 = rotatePoint({
		x:1,
		y:0.5
	}, {
		x:0.5,
		y:0.5
	}, angle);
	gradientElement.attr({
		x1:clamp(p1.x),
		y1:clamp(p1.y),
		x2:clamp(p2.x),
		y2:clamp(p2.y)
	});
	if (colorStops){
		gradientElement.find('stop').each((i, el) => {
			const stop = colorStops[i] || {};
			const color = separateColorOpacity('stop', stop.color || '');
			$(el).attr({
				'offset':'' + ((stop.offset || 0) * 100) + '%',
				'stop-color':color['stop'],
				'stop-opacity':color['stop-opacity']
			});
		});
	}
};
