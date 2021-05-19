import $ from 'jquery';

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
