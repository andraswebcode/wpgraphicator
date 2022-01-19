import {
	Path,
	Polygon,
	Point,
	Object as FabricObject,
	util
} from 'fabric';
import {
	reduce
} from 'underscore';

import PathControl from './class-control-path.js';
import {
	getControlPoint1,
	getControlPoint2,
	serializePath,
	stateProperties,
	toFixed
} from './../utils/utils.js';

const {
	rotatePoint,
	degreesToRadians
} = util;

util.object.extend(Path.prototype, {
	//_setPositionDimensions:Polygon.prototype._setPositionDimensions,
	/**
	 * Extend fabric.Object.prototype._toSVG()
	 * @since 1.0.0
	 */
	_toSVG(){
		const path = serializePath(this.path);
		return [
			'<path ',
			`d="${path}" `,
			'COMMON_PARTS',
			'/>\n'
		];
	},
	/**
	 * Extend fabric.Path.prototype._getOffsetTransform()
	 * @since 1.4.0
	 */
	_getOffsetTransform(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		return ` translate(${toFixed(x)}, ${toFixed(y)})`;
	},
	_adjustPath(){
		const dim = this._calcDimensions();
		const adjustPath = this.path.map(p => p.map((n, i) => {
			if (i === 0){ // command
				return n;
			}
			const min = i % 2 ? dim.left : dim.top;
			return toFixed(n - min);
		}));
		this.path = adjustPath;
		return this;
	},
	_updateBoundingBox(updateTranslation = true){
		const dim = this._calcDimensions();
		const pathOffset = {
			x:dim.width / 2 + dim.left,
			y:dim.height / 2 + dim.top
		};
		this.width = dim.width;
		this.height = dim.height;
		if (updateTranslation){
			const left = (this.pathOffset.x - pathOffset.x) * this.scaleX;
			const top = (this.pathOffset.y - pathOffset.y) * this.scaleY;
			const rotate = rotatePoint(
				new Point(left, top),
				new Point(0, 0),
				degreesToRadians(this.angle)
			);
			this.left -= rotate.x;
			this.top -= rotate.y;
		}
		this.pathOffset = pathOffset;
		this.calcCoords();
		return this;
	},
	_createPathControls(transformControls, drawPath){

		if (!this._pathControls || drawPath){
			const path = this.path;
			this._pathControls = reduce(path, (res, p, i) => {
				switch (p[0]){ // command
					case 'M':
					res[`p${i}`] = new PathControl({
						index:i,
						xIndex:1,
						yIndex:2,
						type:'p',
						controlPoint1:getControlPoint1(path, i),
						controlPoint2:getControlPoint2(path, i)
					});
					break;
					case 'L':
					res[`p${i}`] = new PathControl({
						index:i,
						xIndex:1,
						yIndex:2,
						type:'p',
						controlPoint1:'',
						controlPoint2:''
					});
					break;
					case 'Q':
					res[`c${i}`] = new PathControl({
						index:i,
						xIndex:1,
						yIndex:2,
						type:'c',
						connectPoint1:0 < i ? `p${i - 1}` : '',
						connectPoint2:`p${i}`
					});
					res[`p${i}`] = new PathControl({
						index:i,
						xIndex:3,
						yIndex:4,
						type:'p',
						controlPoint1:`c${i}`,
						controlPoint2:getControlPoint2(path, i)
					});
					break;
					case 'C':
					res[`c1${i}`] = new PathControl({
						index:i,
						xIndex:1,
						yIndex:2,
						type:'c1',
						connectPoint1:0 < i ? `p${i - 1}` : ''
					});
					res[`c2${i}`] = new PathControl({
						index:i,
						xIndex:3,
						yIndex:4,
						type:'c2',
						connectPoint1:`p${i}`
					});
					res[`p${i}`] = new PathControl({
						index:i,
						xIndex:5,
						yIndex:6,
						type:'p',
						controlPoint1:`c2${i}`,
						controlPoint2:getControlPoint2(path, i)
					});
					break;
					default:
					break;
				}
				return res;
			}, {});
		}

		this.controls = transformControls ? FabricObject.prototype.controls : this._pathControls;
		this.hasBorders = transformControls;
		this.canvas.requestRenderAll();

		return this;

	},
	/**
	 * Extend fabric.Path.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['path'])
});
