import {
	Object as FabricObject,
	Point,
	Shadow,
	util
} from 'fabric';
import {
	times,
	random,
	reduce,
	each,
	isUndefined
} from 'underscore';
import {
	DEFAULT_STROKE_WIDTH,
	DEFAULT_STROKE_COLOR,
	DEFAULT_FILL_COLOR,
	BORDER_COLOR,
	CORNER_COLOR,
	CORNER_SIZE
} from './../utils/constants.js';
import {
	toFixed,
	animatables,
	separateColorOpacity,
	stateProperties
} from './../utils/utils.js';

util.object.extend(FabricObject.prototype, {
	/**
	 *
	 * @since 1.0.0
	 * @see TimelineTrack.prototype._setAnime
	 */
	_animationCache:{},
	/**
	 * Extend fabric.Object.prototype.initialize()
	 * @since 1.0.0
	 */
	initialize(options){
		if (options){
			this.setOptions(options);
		}
		const id = times(20, () => random(36).toString(35)).join('');
		const prefix = `wpgraphicator-${this.type}`;
		if (!this.id || this.id.indexOf(prefix) !== 0){
			this.id = `${prefix}-${id}`;
		}
		this._animationCache = reduce(animatables, (res, prop) => {
			res[prop] = '';
			return res;
		}, {});
	},
	/**
	 * Get stroke actual length.
	 * @return {float|int}
	 * @since 1.0.0
	 */
	getStrokeLength(){
		let length = 0;
		switch (this.type){
			case 'rect':
			length = (this.width + this.height) * 2;
			break;
			case 'ellipse':
			const {
				rx,
				ry
			} = this;
			const h = Math.pow((rx - ry), 2) / Math.pow((rx + ry), 2);
			length = (Math.PI * (rx + ry)) * (1 + ((3 * h) / (10 + Math.sqrt(4 - (3 * h)))));
			break;
			case 'circle':
			length = 2 * this.radius * Math.PI;
			break;
			case 'line':
			const p1 = new Point(this.x1, this.y1);
			const p2 = new Point(this.x2, this.y2);
			length = p1.distanceFrom(p2);
			break;
			case 'path':
			const info = util.getPathSegmentsInfo(this.path);
			length = (info[info.length - 1] || {}).length || 0;
			break;
			case 'polygon':
			case 'polyline':
			const points = this.points;
			let _p1, _p2;
			each(points, (p, i) => {
				if (i === 0){
					return;
				}
				_p1 = new Point(points[i].x, points[i].y);
				_p2 = new Point(points[i - 1].x, points[i - 1].y);
				length += _p1.distanceFrom(_p2);
			});
			if (this.type === 'polygon'){
				_p1 = new Point(points[0].x, points[0].y);
				_p2 = new Point(points[points.length - 1].x, points[points.length - 1].y);
				length += _p1.distanceFrom(_p2);
			}
			break;
			case 'i-text':
			break;
			default:
			break;
		}
		return toFixed(length);
	},
	/**
	 * Extend fabric.Object.prototype._createBaseSVGMarkup()
	 * @since 1.0.0
	 */
	_createBaseSVGMarkup(objectMarkup, options = {}){
		const {
			reviver,
			additionalTransform
		} = options;
		const index = objectMarkup.indexOf('COMMON_PARTS');
		const vectorEffect = this.strokeUniform ? 'vector-effect="non-scaling-stroke" ' : '';
		const markup = [
			'<g ',
			this.getSvgTransform(false),
			this.getSvgCommons(),
			'>\n'
		];
		objectMarkup[index] = [
			this.getSvgStyleAttrs(),
			vectorEffect,
			this.addPaintOrder(), ' ',
			additionalTransform ? 'transform="' + additionalTransform + '" ' : ''
		].join('');
		if (this.fill && this.fill.toLive){
			markup.push(this.fill.toSVG(this));
		}
		if (this.stroke && this.stroke.toLive){
			markup.push(this.stroke.toSVG(this));
		}
		markup.push(
			objectMarkup.join(''),
			'</g>\n'
		);
		return reviver ? reviver(markup.join('')) : markup.join('');
	},
	/**
	 * Extend fabric.Object.prototype.getSvgCommons()
	 * @since 1.0.0
	 */
	getSvgCommons(){
		const {
			top,
			left,
			angle,
			scaleX,
			scaleY,
			skewX,
			skewY
		} = this;
		const transform = {
			top,
			left,
			angle,
			scaleX,
			scaleY,
			skewX,
			skewY
		};
		return [
			this.id ? `class="${this.id}" ` : '',
			`data-transform='${JSON.stringify(transform)}'`
		].join('');
	},
	getSvgStyleAttrs(){
		const stroke = this.stroke ? separateColorOpacity('stroke', this.stroke) : '';
		const strokeWidth = this.strokeWidth ? this.strokeWidth : '0';
		const strokeDashArray = this.strokeDashArray ? this.strokeDashArray.join(' ') : 'none';
		const strokeDashOffset = this.strokeDashOffset ? this.strokeDashOffset : '0';
		const strokeLineCap = this.strokeLineCap ? this.strokeLineCap : 'butt';
		const strokeLineJoin = this.strokeLineJoin ? this.strokeLineJoin : 'miter';
		const strokeMiterLimit = this.strokeMiterLimit ? this.strokeMiterLimit : '4';
		const fill = this.fill ? separateColorOpacity('fill', this.fill) : '';
		const fillRule = this.fillRule ? this.fillRule : 'nonzero';
		const opacity = !isUndefined(this.opacity) ? this.opacity : '1';
		return [
			`stroke="${stroke ? stroke['stroke'] : 'none'}"`,
			`stroke-opacity="${stroke ? stroke['stroke-opacity'] : 0}"`,
			`stroke-width="${strokeWidth}"`,
			`stroke-dasharray="${strokeDashArray}"`,
			`stroke-dashoffset="${strokeDashOffset}"`,
			`stroke-linecap="${strokeLineCap}"`,
			`stroke-linejoin="${strokeLineJoin}"`,
			`stroke-miterlimit="${strokeMiterLimit}"`,
			`fill="${fill ? fill['fill'] : 'none'}"`,
			`fill-opacity="${fill ? fill['fill-opacity'] : 0}"`,
			`fill-rule="${fillRule}"`,
			`opacity="${opacity}" `
		].join(' ');
	},
	/**
	 * Extend fabric.Object.prototype._set()
	 * @since 1.0.0
	 */
	_set(key, value){
		const isChanged = this[key] !== value;
		let groupNeedsUpdate = false;
		if (key === 'shadow' && value && !(value instanceof Shadow)){
			value = new Shadow(value);
		} else if (key === 'dirty' && this.group) {
			this.group.set('dirty', value);
		}
		this[key] = value;
		if (isChanged){
			groupNeedsUpdate = this.group && this.group.isOnACache();
			if (this.cacheProperties.indexOf(key) > -1){
				this.dirty = true;
				groupNeedsUpdate && this.group.set('dirty', true);
			} else if (groupNeedsUpdate && this.stateProperties.indexOf(key) > -1){
				this.group.set('dirty', true);
			}
		}
		return this;
	},
	stateProperties,
	stroke:DEFAULT_STROKE_COLOR,
	strokeWidth:DEFAULT_STROKE_WIDTH,
	fill:DEFAULT_FILL_COLOR,
	perPixelTargetFind:true,
	objectCaching:false,
	//statefullCache:true,
	centeredScaling:true,
	lockScalingFlip:true,
	//lockSkewingX:true,
	//lockSkewingY:true,
	originX:'center',
	originY:'center',
	borderColor:BORDER_COLOR,
	cornerColor:CORNER_COLOR,
	cornerSize:CORNER_SIZE,
	transparentCorners:false
});
