import $ from 'jquery';

/**
 * List of available SVG shapes.
 * @return {string}
 * @since 1.1.0
 */

export const svgShapes = 'rect,circle,ellipse,line,polygon,polyline,path,image,text';

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

export function toFixed(value) {
	const _value = parseFloat(value) || 0;
	return Math.round(_value * 1000000) / 1000000;
}

/**
 *
 * @param {string} prop
 * @param {string} value
 * @return {string}
 * @since 1.0.0
 */

export function separateColorOpacity(prop = 'stroke', value = '#000'){
	const isRgba = value.indexOf('rgba') >= 0;
	const output = {};
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
 * @param {array} collection Collection of objects.
 * @param {string} iteratee
 * @return {string}
 * @since 1.0.0
 */

export function min(collection = [], iteratee) {
	let result, computed, lastComputed = Infinity;
	$.each(collection, (i, obj) => {
		computed = toFixed(obj[iteratee]);
		if (computed < lastComputed){
			result = obj;
			lastComputed = computed;
		}
	});
	return result;
}

/**
 *
 * @param {string} gradient Serialized gradient values.
 * @return {object}
 * @since 1.1.0
 */

export function parseGradient(gradient = ''){
	if (!parseGradient.cache){
		parseGradient.cache = {};
	}
	if (parseGradient.cache[gradient]){
		return parseGradient.cache[gradient];
	}
	const datas = gradient.split(';');
	if (datas[0] !== 'GRADIENT'){
		return {};
	}
	const type = datas[1] || 'linear';
	const angle = parseFloat(datas[2]) || 0;
	const colorStops = datas.slice(3).map(data => {
		const _data = data.split('_');
		return {
			color:_data[0],
			offset:parseFloat(_data[1])
		};
	});
	parseGradient.cache[gradient] = {
		type,
		angle,
		colorStops
	};
	return parseGradient.cache[gradient];
}

/**
 *
 * @param {object} point
 * @param {object} center
 * @param {float} angle
 * @return {object}
 * @since 1.1.0
 */

export function rotatePoint(point = {}, center = {}, angle = 0) {
	point.x -= center.x;
	point.y -= center.y;
	const radian = angle * (Math.PI / 180);
	const sin = Math.sin(radian);
	const cos = Math.cos(radian);
	const rx = point.x * cos - point.y * sin;
	const ry = point.x * sin + point.y * cos;
	return {
		x:toFixed(rx + center.x),
		y:toFixed(ry + center.y)
	};
}
