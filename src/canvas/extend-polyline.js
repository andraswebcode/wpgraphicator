import {
	Polyline,
	Point,
	Path,
	Object as FabricObject,
	util
} from 'fabric';
import {
	reduce
} from 'underscore';

import PolylineControl from './class-control-polyline.js';
import {
	toFixed,
	serializePoints,
	stateProperties
} from './../utils/utils.js';

util.object.extend(Polyline.prototype, {
	toSVG(reviver){
		var additionalTransform = this._getOffsetTransform();
		return this._createBaseSVGMarkup(this._toSVG(), {
			reviver,
			additionalTransform
		});
	},
	_toSVG(){
		return [
			`<${this.type} `,
			'COMMON_PARTS',
			`points="${serializePoints(this.points)}`,
			`" />\n`
		];
	},
	_getOffsetTransform(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		return ` translate(${x}, ${y})`;
	},
	_adjustPoints(){
		const dim = this._calcDimensions();
		const adjustPoints = this.points.map(p => new Point(
			toFixed(p.x - dim.left),
			toFixed(p.y - dim.top)
		));
		this.points = adjustPoints;
		return this;
	},
	_updateBoundingBox:Path.prototype._updateBoundingBox,
	_createPolylineControls(transformControls, drawPolyline){

		if (!this._polylineControls || drawPolyline){
			const points = this.points;
			this._polylineControls = reduce(points, (res, p, i) => {
				res[`p${i}`] = new PolylineControl({
					index:i
				});
				return res;
			}, {});
		}

		this.controls = transformControls ? FabricObject.prototype.controls : this._polylineControls;
		this.hasBorders = transformControls;
		this.canvas.requestRenderAll();

		return this;

	},
	/**
	 * Extend fabric.Polyline.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['points'])
});
