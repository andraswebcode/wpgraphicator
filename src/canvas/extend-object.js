import {
	Object as FabricObject,
	Point,
	Shadow,
	Gradient,
	util
} from 'fabric';
import {
	times,
	random,
	reduce,
	each,
	isUndefined,
	isObject
} from 'underscore';
import {
	DEFAULT_STROKE_WIDTH,
	DEFAULT_STROKE_COLOR,
	DEFAULT_FILL_COLOR,
	BORDER_COLOR,
	CORNER_COLOR,
	CORNER_SIZE,
	BORDER_OPACITY_WHEN_MOVING
} from './../utils/constants.js';
import {
	toFixed,
	animatables,
	separateColorOpacity,
	stateProperties
} from './../utils/utils.js';
import OriginControl from './class-control-origin.js';

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
		if (!this.id || `${this.id}`.indexOf(prefix) !== 0){
			this.id = `${prefix}-${id}`;
		}
		this._animationCache = reduce(animatables, (res, prop) => {
			res[prop] = '';
			return res;
		}, {});
		this.centeredScaling = !!(this.originX === 'center' && this.originY === 'center');
		this.centeredRotation = !!(this.originX === 'center' && this.originY === 'center');
	},
	/**
	 * Extend fabric.Object.prototype.moveTo()
	 * @since 1.0.0
	 *//*
	moveTo(index){
		if (this.group && this.group.type !== 'activeSelection') {
			fabric.StaticCanvas.prototype.moveTo.call(this.group, this, index);
		}
		else if (this.canvas) {
			this.canvas.moveTo(this, index);
			each(this.canvas._objects, (obj, i) => {
				obj.zIndex = i;
			});
		}
		return this;
	},*/
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
	 * Useful for SVG exporter.
	 * @return {object}
	 * @since 1.4.0
	 */
	_calcSVGTransformByOrigin(){
		const transform = {
			x:0,
			y:0
		};
		const {
			width,
			height,
			originX,
			originY,
			strokeWidth
		} = this;
		const s2 = strokeWidth / 2;
		const oX = parseFloat(originX) || 0;
		const oY = parseFloat(originY) || 0;
		switch (this.type){
			case 'circle':
			case 'ellipse':
			case 'group':
				// Horizontal
				if (originX === 'left'){
					transform.x = s2 + (width / 2);
				} else if (originX === 'right'){
					transform.x = - (width / 2) - s2;
				} else if (originX === 'center'){
					transform.x = 0;
				} else {
					transform.x = - (oX * (width + strokeWidth) - (width + strokeWidth) / 2);
				}
				// Vertical
				if (originY === 'top'){
					transform.y = s2 + (height / 2);
				} else if (originY === 'bottom'){
					transform.y = - (height / 2) - s2;
				} else if (originY === 'center'){
					transform.y = 0;
				} else {
					transform.y = - (oY * (height + strokeWidth) - (height + strokeWidth) / 2);
				}
			break;
			case 'path':
			case 'polyline':
			case 'polygon':
				const po = this.pathOffset;
				const diffX = (this.width - po.x * 2) / 2;
				const diffY = (this.height - po.y * 2) / 2;
				// Horizontal
				if (originX === 'left'){
					transform.x = diffX + s2;
				} else if (originX === 'right'){
					transform.x = - po.x * 2 - diffX - s2;
				} else if (originX === 'center'){
					transform.x = - po.x;
				} else {
					transform.x = - ((po.x * 2) * oX) + s2 - strokeWidth * oX + (diffX * (0.5 - oX) * 2);
				}
				// Vertical
				if (originY === 'top'){
					transform.y = diffY + s2;
				} else if (originY === 'bottom'){
					transform.y = - po.y * 2 - diffY - s2;
				} else if (originY === 'center'){
					transform.y = - po.y;
				} else {
					transform.y = - ((po.y * 2) * oY) + s2 - strokeWidth * oY + (diffY * (0.5 - oY) * 2);
				}
			break;
			case 'i-text':
				const align = this.textAlign;
				// Horizontal
				if (originX === 'left'){
					transform.x = (align === 'center') ? width / 2 : (align === 'right') ? width : 0;
				} else if (originX === 'right'){
					transform.x = (align === 'center') ? - (width / 2) : (align === 'right') ? 0 : - width;
				} else if (originX === 'center'){
					transform.x = (align === 'center') ? 0 : (align === 'right') ? width / 2 : - (width / 2);
				} else {
					transform.x = (align === 'center') ? width * (0.5 - oX) : (align === 'right') ? width * (1 - oX) : - (width * oX);
				}
				// Vertical
				if (originY === 'top'){
					transform.y = 0;
				} else if (originY === 'bottom'){
					transform.y = - height;
				} else if (originY === 'center'){
					transform.y = - (height / 2);
				} else {
					transform.y = - (height * oY);
				}
			break;
			default:
				// Horizontal
				if (originX === 'left'){
					transform.x = s2;
				} else if (originX === 'right'){
					transform.x = - s2 - width;
				} else if (originX === 'center'){
					transform.x = - (width / 2);
				} else {
					transform.x = - (oX * width) + s2 - strokeWidth * oX;
				}
				// Vertical
				if (originY === 'top'){
					transform.y = s2;
				} else if (originY === 'bottom'){
					transform.y = - s2 - height;
				} else if (originY === 'center'){
					transform.y = - (height / 2);
				} else {
					transform.y = - (oY * height) + s2 - strokeWidth * oY;
				}
			break;
		}
		return transform;
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
		const clipPath = this.clipPath;
		if (clipPath){
			const cpId = times(20, () => random(36).toString(35)).join('');
			clipPath.clipPathId = `WPG_CLIPPATH_ID-${cpId}`;
		}
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
		if (clipPath){
			markup.push(
				`<clipPath id="${clipPath.clipPathId}" >\n`,
				clipPath.toClipPathSVG(reviver),
				'</clipPath>\n'
			);
		}
		markup.push(
			objectMarkup.join(''),
			'</g>\n'
		);
		return reviver ? reviver(markup.join('')) : markup.join('');
	},
	/**
	 * Extend fabric.Object.prototype.getSvgTransform()
	 * @since 1.0.0
	 */
	getSvgTransform(full, additionalTransform){
		const originalTransform = full ? this.calcTransformMatrix() : this.calcOwnMatrix();
		const transform = util.composeMatrix({
			translateX:this.left,
			translateY:this.top,
			scaleX:this.scaleX,
			scaleY:this.scaleY,
			skewX:this.skewX,
			skewY:this.skewY,
			angle:this.angle
		});
		const needOriginal = !!(this.group && this.originX === 'center' && this.originY === 'center');
		const svgTransform = 'transform="' + util.matrixToSVG(needOriginal ? originalTransform : transform);
		return svgTransform + (additionalTransform || '') + '" ';
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
			skewY,
			originX,
			originY
		} = this;
		const transform = {
			top,
			left,
			angle,
			scaleX,
			scaleY,
			skewX,
			skewY,
			originX,
			originY
		};
		// Debug.
		if (this.group){
			transform.opacity = this.opacity;
		}
		return [
			this.id ? `class="${this.id}" ` : '',
			`data-transform='${JSON.stringify(transform)}' `,
			this.clipPath ? `clip-path="url(#${this.clipPath.clipPathId})"` : ''
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
		} else if ((key === 'fill' || key === 'stroke') && isObject(value) && !(value instanceof Gradient)){
			value = new Gradient(value);
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
		if ((key === 'originX' || key === 'originY') && !this.group){
			this.centeredScaling = !!(this.originX === 'center' && this.originY === 'center');
			this.centeredRotation = !!(this.originX === 'center' && this.originY === 'center');
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
	borderOpacityWhenMoving:BORDER_OPACITY_WHEN_MOVING,
	transparentCorners:false
});

util.object.extend(FabricObject.prototype.controls, {
	o:new OriginControl()
});
