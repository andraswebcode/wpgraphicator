import $ from 'jquery';

import {
	toFixed,
	clamp,
	min
} from './utils/utils.js';
import {
	getTransformMatrix,
	decompose
} from './utils/matrix.js';
import {
	getShapeStyles,
	getShapeAttrs
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

export const update = (target, svgElement, shapeId, type) => {
	const wrapper = svgElement.find(`.${shapeId}`);
	const shape = wrapper.children().first();
	const defMatrix = (wrapper.attr('transform') || '')
		.replace('matrix(', '')
		.replace(')', '')
		.split(' ')
		.map(toFixed);
	return () => {
		const matrix = getTransformMatrix({
			...decompose(defMatrix),
			...target
		}).map(toFixed).join(' ');
		wrapper.attr('transform', `matrix(${matrix})`);
		shape.attr({
			...getShapeAttrs(target, type),
			...getShapeStyles(target)
		});
		if (type === 'i-text' && target.fontSize){
			if (shape.length && shape[0].getBBox){
				const textAnchor = shape.attr('text-anchor');
				const {
					width = 1,
					height = 1,
					x = 0,
					y = 0
				} = shape[0].getBBox();
				const offsetX = (textAnchor === 'middle') ? 0 : (textAnchor === 'end') ? width / 2 : - ((width + x) / 2);
				const offsetY = - ((height + y) / 2);
				shape.attr('transform', `translate(${offsetX} ${offsetY})`);
			}
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
