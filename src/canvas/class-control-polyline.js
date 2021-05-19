import {
	Control,
	util
} from 'fabric';

const {
	transformPoint,
	multiplyTransformMatrices
} = util;

/**
 * The polyline control class.
 * @since 1.0.0
 * @class
 * @extends fabric.Control
 */

export default class extends Control {

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @param {object} options
	 */

	constructor(options = {}){
		super(options);
		this.actionName = 'modifyPolyline';
	}

	/**
	 * Set position of control.
	 * @since 1.0.0
	 * @param {object} dim
	 * @param {array} finalMatrix
	 * @param {object} fabricObject
	 * @return {object}
	 */

	positionHandler(dim, finalMatrix, fabricObject){
		return transformPoint({
			x:fabricObject.points[this.index].x - fabricObject.pathOffset.x,
			y:fabricObject.points[this.index].y - fabricObject.pathOffset.y
		}, multiplyTransformMatrices(
			fabricObject.canvas.viewportTransform,
			fabricObject.calcTransformMatrix()
		));
	}

	/**
	 * Action event handler of control.
	 * @since 1.0.0
	 * @param {object} eventData
	 * @param {object} transformData
	 * @param {int} x
	 * @param {int} y
	 * @return {boolean}
	 */

	actionHandler(eventData, transformData, x, y){
		const fabricObject = transformData.target;
		const currentControl = fabricObject.controls[transformData.corner];
		const pointerLocalPosition = fabricObject.toLocalPoint({x, y}, 'center', 'center');
		const fX = fabricObject.flipX ? -1 : 1;
		const fY = fabricObject.flipY ? -1 : 1;
		const pX = pointerLocalPosition.x * fX / fabricObject.scaleX + fabricObject.pathOffset.x;
		const pY = pointerLocalPosition.y * fY / fabricObject.scaleY + fabricObject.pathOffset.y;
		fabricObject.points[currentControl.index].x = Math.round(pX * 100) / 100;
		fabricObject.points[currentControl.index].y = Math.round(pY * 100) / 100;
		fabricObject.canvas && fabricObject.canvas.fire('object:morphing', {
			e:eventData,
			transform:transformData,
			target:fabricObject,
			pointer:{x, y}
		});
		return true;
	}

	/**
	 * Mouse down event handler of control.
	 * @since 1.0.0
	 * @param {object} eventData
	 * @param {object} transformData
	 * @param {int} x
	 * @param {int} y
	 * @return {boolean}
	 */

	mouseDownHandler(eventData, transformData, x, y){
		const fabricObject = transformData.target;
		const currentControl = fabricObject.controls[transformData.corner];
		fabricObject._currentPolylineControl = currentControl;
	}

}
