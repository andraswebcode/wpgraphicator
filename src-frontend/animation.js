import $ from 'jquery';

import {
	toFixed,
	clamp,
	min,
	svgShapes
} from './utils/utils.js';
import {
	getTransformMatrix,
	decompose
} from './utils/matrix.js';
import {
	getShapeStyles,
	getShapeAttrs,
	setGradient
} from './utils/style.js';

export const getKeyframes = shape => (shape.properties || []).reduce((result, prop) => {
	let first = min(prop.transitions, 'second');
	let tl = prop.transitions;
	if (first.second !== 0){
		first = {...first};
		first.second = 0;
		tl = [first].concat(tl);
	}
	result[prop.id] = tl.map((tr, i) => ({
		easing:tr.easing,
		duration:i === 0 ? tr.second * 1000 : (tr.second - tl[i - 1].second) * 1000,
		value:tr.value
	}));
	return result;
}, {});

export const update = (target, svgElement, shapeId, type, origin) => {
	const wrapper = svgElement.find(`.${shapeId}`);
	const shape = wrapper.find(svgShapes);
	const defMatrix = (wrapper.attr('transform') || '')
		.replace('matrix(', '')
		.replace(')', '')
		.split(' ')
		.map(toFixed);
	let fillGradient, strokeGradient;
	if (shape.attr('fill') && shape.attr('fill').indexOf('url(#') === 0){
		fillGradient = wrapper.find(shape.attr('fill').replace('url(', '').replace(')', ''));
	}
	if (shape.attr('stroke') && shape.attr('stroke').indexOf('url(#') === 0){
		strokeGradient = wrapper.find(shape.attr('stroke').replace('url(', '').replace(')', ''));
	}
	return () => {
		const matrix = getTransformMatrix({
			...decompose(defMatrix),
			...target
		}).map(toFixed).join(' ');
		wrapper.attr('transform', `matrix(${matrix})`);
		if (type === 'group'){
			wrapper.attr({
				...getShapeAttrs(target, type, origin, shape),
				...getShapeStyles(target)
			});
		} else {
			shape.attr({
				...getShapeAttrs(target, type, origin, shape),
				...getShapeStyles(target)
			});
		}
		if (fillGradient && target.fill){
			setGradient(fillGradient, target.fill);
		}
		if (strokeGradient && target.stroke){
			setGradient(strokeGradient, target.stroke);
		}
	};
};

/**
 *
 * @since 1.0.0
 * @param {object} svgElement JQuery object.
 * @param {int} offset
 * @param {int} repeat
 * @param {int} duration
 * @return {int}
 */

export const getTimeOnScroll = (svgElement, offset = 50, repeat = 1, duration = 1) => {
	const winHeight = $(window).height();
	const scrollTop = $(window).scrollTop();
	const svgHeight = svgElement.height();
	const svgTop = svgElement.position().top;
	const _offset = winHeight * offset / 100;
	const totalDuration = repeat * duration;
	const time = (_offset - (svgTop - scrollTop)) * (totalDuration / svgHeight);
	return clamp(time, 0, totalDuration);
};
