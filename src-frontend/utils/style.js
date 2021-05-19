import $ from 'jquery';
import {
	separateColorOpacity
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
			if (props[jsVal]){
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
