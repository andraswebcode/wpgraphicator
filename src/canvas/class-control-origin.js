import {
	Control,
	Point,
	controlsUtils,
	util,
	iMatrix
} from 'fabric';
import {
	isString,
	isNumber
} from 'underscore';

import {
	CORNER_COLOR,
	TRANSFORM_ORIGIN_TOLERANCE
} from './../utils/constants.js';

const {
	transformPoint,
	multiplyTransformMatrices
} = util;

const {
	renderCircleControl
} = controlsUtils;

/**
 * The transform origin control class.
 * @since 1.4.0
 * @class
 * @extends fabric.Control
 */

export default class extends Control {

	/**
	 * Constructor.
	 * @since 1.4.0
	 * @param {object} options
	 */

	constructor(options = {}){
		super(options);
		this.actionName = 'setOrigin';
	}

	/**
	 * Render control.
	 * @since 1.4.0
	 * @param {object} ctx
	 * @param {int} left
	 * @param {int} top
	 * @param {object} styleOverride
	 * @param {object} fabricObject
	 */

	render(ctx, left, top, styleOverride, fabricObject){
		styleOverride.cornerStrokeColor = CORNER_COLOR;
		styleOverride.cornerColor = 'rgba(0, 0, 0, 0)';
		// Render circle.
		renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
		const size = fabricObject.cornerSize;
		ctx.save();
		// Render cross.
		ctx.beginPath();
		ctx.moveTo(left - size, top);
		ctx.lineTo(left + size, top);
		ctx.moveTo(left, top - size);
		ctx.lineTo(left, top + size);
		ctx.stroke();
		ctx.restore();
	}

	/**
	 * Set position of control.
	 * @since 1.4.0
	 * @param {object} dim
	 * @param {array} finalMatrix
	 * @param {object} fabricObject
	 * @return {object}
	 */

	positionHandler(dim, finalMatrix, fabricObject){
		const {
			width,
			height,
			originX,
			originY,
			__originX,
			__originY,
			strokeWidth
		} = fabricObject;
		const oX = __originX || originX;
		const oY = __originY || originY;
		const s2 = strokeWidth / 2;
		let x = 0, y = 0;
		// Horizontal
		if (oX === 'left'){
			x = - width / 2 - s2;
		} else if (oX === 'right'){
			x = width / 2 + s2;
		} else if (oX === 'center'){
			x = 0;
		} else {
			x = (parseFloat(oX) || 0) * (width + strokeWidth) - (width + strokeWidth) / 2;
		}
		// Vertical
		if (oY === 'top'){
			y = - height / 2 - s2;
		} else if (oY === 'bottom'){
			y = height / 2 + s2;
		} else if (oY === 'center'){
			y = 0;
		} else {
			y = (parseFloat(oY) || 0) * (height + strokeWidth) - (height + strokeWidth) / 2;
		}
		return transformPoint({
			x,
			y
		}, multiplyTransformMatrices(
			fabricObject.canvas?.viewportTransform || iMatrix.slice(),
			fabricObject.calcTransformMatrix()
		));
	}

	/**
	 * Action event handler of control.
	 * @since 1.4.0
	 * @param {object} eventData
	 * @param {object} transformData
	 * @param {int} x
	 * @param {int} y
	 * @return {boolean}
	 */

	actionHandler(eventData, transformData, x, y){
		const fabricObject = transformData.target;
		const localPoint = fabricObject.toLocalPoint(new Point(x, y), 'left', 'top');
		const {
			width,
			height,
			scaleX,
			scaleY,
			originX,
			originY,
			__originX,
			__originY,
			strokeWidth
		} = fabricObject;
		const pX = localPoint.x / scaleX;
		const pY = localPoint.y / scaleY;
		const w = width + strokeWidth;
		const h = height + strokeWidth;
		const t2 = TRANSFORM_ORIGIN_TOLERANCE / 2;
		const oX = __originX || originX;
		const oY = __originY || originY;
		const isSpecX = !!(isString(oX) || oX === 0.001 || oX === 0.5 || oX === 1);
		const isSpecY = !!(isString(oY) || oY === 0.001 || oY === 0.5 || oY === 1);
		if (pX > - t2 && pX < t2){ // Left
			fabricObject.__originX = isSpecY ? 'left' : 0.001;
		} else if (pX > w / 2 - t2 && pX < w / 2 + t2){ // Center
			fabricObject.__originX = isSpecY ? 'center' : 0.5;
		} else if (pX > w - t2 && pX < w + t2){ // Right
			fabricObject.__originX = isSpecY ? 'right' : 1;
		} else {
			fabricObject.__originX = pX / w;
		}
		if (pY > - t2 && pY < t2){ // Top
			fabricObject.__originY = isSpecX ? 'top' : 0.001;
		} else if (pY > h / 2 - t2 && pY < h / 2 + t2){ // Center
			fabricObject.__originY = isSpecX ? 'center' : 0.5;
		} else if (pY > h - t2 && pY < h + t2){ // Bottom
			fabricObject.__originY = isSpecX ? 'bottom' : 1;
		} else {
			fabricObject.__originY = pY / h;
		}
		return true;
	}

}
