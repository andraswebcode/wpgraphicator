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
 * @return {object}
 */

export const getShapeAttrs = (props = {}, type) => {
	const output = {};
	switch (type){
		case 'ellipse':
		if (props.width){
			output.width = props.width;
			output.rx = props.width / 2;
		}
		if (props.height){
			output.height = props.height;
			output.ry = props.height / 2;
		}
		break;
		case 'circle':
		if (props.radius){
			output.r = props.radius;
		}
		break;
		case 'rect':
		if (props.width){
			output.width = props.width;
			output.x = - (props.width / 2);
		}
		if (props.height){
			output.height = props.height;
			output.y = - (props.height / 2);
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
