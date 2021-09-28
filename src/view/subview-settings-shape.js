import $ from 'jquery';
import {
	throttle,
	debounce,
	contains,
	isArray,
	isObject,
	pick,
	each
} from 'underscore';
import {
	i18n,
	media
} from 'wordpress';
import {
	Gradient,
	util
} from 'fabric';

import Subview from './subview.js';
import Project from './frame-project.js';
import {
	replaceCollidedParams,
	webSafeFonts,
	toFixed,
	serializePath,
	serializePoints,
	serializeGradient
} from './../utils/utils.js';
import {
	COLOR_PICKER_WIDTH,
	DEFAULT_FILL_COLOR,
	DEFAULT_STROKE_COLOR
} from './../utils/constants.js';

const {
	__
} = i18n;
const {
	qrDecompose
} = util;

/**
 * Settings shape subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 * @mixes Project
 */

export default Subview.extend(/** @lends SettingsShape.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'settings-shape',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'change .wpg-settings-shape__transform-input':'_setProperty',
		'change .wpg-settings-shape__dimensions-input':'_setProperty',
		'change .wpg-settings-shape__stroke-dash-offset-input':'_setProperty',
		'change .wpg-settings-shape__fill-type-select':'_setFillType',
		'change .wpg-settings-shape__stroke-type-select':'_setStrokeType',
		'change .wpg-settings-shape__stroke-others-select':'_setNonAnimatableStringValue',
		'change .wpg-settings-shape__fill-rule-select':'_setNonAnimatableStringValue',
		'change .wpg-settings-shape__path-input':'_setPath',
		'change .wpg-settings-shape__polyline-input':'_setPolyline',
		'change .wpg-settings-shape__font-select':'_setNonAnimatableStringValue',
		'change .wpg-settings-shape__image-size-select':'_setImageSize',
		'click .wpg-settings-shape__path-update-bb-button':'_updateBoundingBox',
		'click .wpg-settings-shape__image-replace':'_replaceImage',
		'click .wpg-settings-shape__add-to-stream-button':'_addToStream'
	},

	/**
	 * Additional params for underscore template.
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		return {
			getSelectedShape:this._getSelectedShape.bind(this),
			webSafeFonts
		};
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		// Debounce is only needed when we trigger object:modified on arrows keydown.
		// @see frame Project._onSceneKeyDown()
		this.scene.on('object:modified', debounce(this.render.bind(this), 200));
		this.scene.on('path:created', this.render.bind(this));
		this.listenTo(this.history.stack, 'wpg:undoredo', this.render);
		this.listenTo(this.state, 'change:currentTime', debounce(this.render.bind(this), 200));
	},

	/**
	 * Initialize plugins after underscore template rendered.
	 * @since 1.0.0
	 * @access private
	 */

	_initPlugins(){
		const shape = this._getSelectedShape();
		const shapeModel = this._getSelectedShapeModel();
		const activeSettingsTabs = this.getState('activeSettingsTabs');
		this.$('.wpg-tab').each(function(i, elem) {
			const tab = $(elem);
			const id = tab.attr('id');
			tab.toggleClass('active', contains(activeSettingsTabs, id));
		});
		if (!shapeModel){
			return;
		}
		if (isObject(shape.stroke)){
			this.$('.wpg-settings-shape__stroke-gradient-input').gradientPicker({
				width:COLOR_PICKER_WIDTH,
				gradient:shape.stroke?.toObject(['angle']),
				change:throttle((e, {gradient}) => this._setPropertyWithPlugin('stroke', serializeGradient(gradient)), 200)
			});
		} else {
			this.$('.wpg-settings-shape__stroke-color-input').colorPicker({
				width:COLOR_PICKER_WIDTH,
				change:throttle((e, {color}) => this._setPropertyWithPlugin('stroke', color.toString()), 200)
			});
		}
		this.$('.wpg-settings-shape__stroke-width-input').rangeSlider({
			value:shape.strokeWidth,
			change:throttle((e, {value}) => this._setPropertyWithPlugin('strokeWidth', value), 200)
		});
		this.$('.wpg-settings-shape__stroke-dash-array-input').strokeDashArrayControl({
			labels:{
				addValue:__('Add Value', 'wpgraphicator'),
				dashes:__('Dashes', 'wpgraphicator'),
				gaps:__('Gaps', 'wpgraphicator')
			},
			value:shape.strokeDashArray,
			change:throttle((e, {value}) => this._setPropertyWithPlugin('strokeDashArray', value), 200)
		});
		if (isObject(shape.fill)){
			this.$('.wpg-settings-shape__fill-gradient-input').gradientPicker({
				width:COLOR_PICKER_WIDTH,
				gradient:shape.fill?.toObject(['angle']),
				change:throttle((e, {gradient}) => this._setPropertyWithPlugin('fill', serializeGradient(gradient)), 200)
			});
		} else {
			this.$('.wpg-settings-shape__fill-color-input').colorPicker({
				width:COLOR_PICKER_WIDTH,
				change:throttle((e, {color}) => this._setPropertyWithPlugin('fill', color.toString()), 200)
			});
		}
		this.$('.wpg-settings-shape__opacity-input').rangeSlider({
			value:shape.opacity,
			min:0,
			max:1,
			step:0.01,
			change:throttle((e, {value}) => this._setPropertyWithPlugin('opacity', value), 200)
		});
		if (shapeModel.get('type') === 'i-text'){
			this.$('.wpg-settings-shape__font-size-input').rangeSlider({
				min:1,
				max:400,
				value:shape.fontSize,
				change:throttle((e, {value}) => this._setPropertyWithPlugin('fontSize', value), 200)
			});
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {object} Fabric object, or empty object.
	 */

	_getSelectedShape(){
		return this.scene.getActiveObject() || {};
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {object|undefined} A backbone model.
	 */

	_getSelectedShapeModel(){
		const ids = this.getState('selectedShapeIds') || [];
		return this.shapes.get(ids[0]);
	},

	/**
	 *
	 * @since 1.2.0
	 * @access private
	 * @return {array} An array of backbone models.
	 */

	_getSelectedShapeModels(){
		const ids = this.getState('selectedShapeIds') || [];
		if (!ids.length || !ids[0]){
			return [];
		}
		return ids.map(id => this.shapes.get(id));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {string} property
	 * @param {mixed} value
	 */

	_setPropertyWithPlugin(property, value){
		const shape = this._getSelectedShape();
		if (shape?.type === 'activeSelection'){
			const models = this._getSelectedShapeModels();
			each(models, model => {
				const shape = this.scene.getObjectById(model.get('id'));
				if (!shape){
					return;
				}
				this.__updateProperty(model, property, value);
				if (replaceCollidedParams[property]){
					shape.set(property, replaceCollidedParams[property](value));
				} else {
					shape.set(property, value);
				}
			});
			this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shape._objects);
		} else {
			const shapeModel = this._getSelectedShapeModel();
			if (!shapeModel){
				return;
			}
			shape.saveState();
			this.__updateProperty(shapeModel, property, value);
			if (replaceCollidedParams[property]){
				shape.set(property, replaceCollidedParams[property](value));
			} else {
				shape.set(property, value);
			}
			shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', shape);
		}
		this.scene.requestRenderAll();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setProperty(e){
		const shape = this._getSelectedShape();
		const input = $(e.target);
		const property = input.data('property');
		const value = parseFloat(input.val()) || 0;
		if (shape?.type === 'activeSelection'){
			const models = this._getSelectedShapeModels();
			const isTranslating = (property === 'left' || property === 'top');
			if (isTranslating){
				shape.set(property, value);
			}
			each(shape._objects, object => {
				const model = this.shapes.get(object.id);
				this.__updateProperty(model, property, isTranslating ? shape[property] + object[property] : value);
				if (!isTranslating){
					if (replaceCollidedParams[property]){
						object.set(property, replaceCollidedParams[property](value));
					} else {
						object.set(property, value);
					}
				}
			});
			this.scene.requestRenderAll();
			this.shapes.trigger('wpg:pushtohistorystack', models, 'bulk:change', shape._objects);
			return;
		}
		const shapeModel = this._getSelectedShapeModel();
		if (!shapeModel || !property){
			return;
		}
		shape.saveState();
		this.__updateProperty(shapeModel, property, value);
		if (replaceCollidedParams[property]){
			shape.set(property, replaceCollidedParams[property](value));
		} else {
			shape.set(property, value);
		}
		if (shape.type === 'ellipse'){ // Update rx and ry also.
			if (property === 'width'){
				shape.set('rx', value / 2);
			} else if (property === 'height'){
				shape.set('ry', value / 2);
			}
		} else if (shape.type === 'circle' && property === 'radius'){ // Update width and height also.
			shape.set({
				width:value * 2,
				height:value * 2
			});
		}
		this.scene.requestRenderAll();
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', shape);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setPath(e){
		const shapeModel = this._getSelectedShapeModel();
		if (!shapeModel){
			return;
		}
		const shape = this._getSelectedShape();
		const target = $(e.target);
		const wrapper = target.closest('.wpg-settings-shape__path-input-wrapper');
		const path = wrapper
			.find('span, .wpg-input')
			.map((i, elem) => $(elem).val() || $(elem).text())
			.toArray()
			.join(' ');
		shape.saveState();
		this.__updateProperty(shapeModel, 'path', path);
		shape.path = replaceCollidedParams.path(path);
		this.scene.requestRenderAll();
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', shape);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setPolyline(e){
		const shapeModel = this._getSelectedShapeModel();
		if (!shapeModel){
			return;
		}
		const shape = this._getSelectedShape();
		const target = $(e.target);
		const wrapper = target.closest('.wpg-settings-shape__polyline-input-wrapper');
		const points = wrapper
			.find('.wpg-settings-shape__polyline-point')
			.map((i, elem) => $(elem).find('.wpg-input').map((i, el) => $(el).val()).toArray().join(','))
			.toArray()
			.join(' ');
		shape.saveState();
		this.__updateProperty(shapeModel, 'points', points);
		shape.points = replaceCollidedParams.points(points);
		this.scene.requestRenderAll();
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', shape);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_updateBoundingBox(e){
		e.preventDefault();
		const shape = this._getSelectedShape();
		if (shape && shape._updateBoundingBox){
			shape._updateBoundingBox();
			this.scene.requestRenderAll();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setImageSize(e){
		const shape = this._getSelectedShape();
		const wpId = shape?.wpId;
		if (!wpId){
			return;
		}
		const attachment = media.attachment(wpId);
		const size = $(e.target).val();
		if (attachment.get('sizes')){
			const url = attachment.get('sizes')[size]?.url;
			shape.setSrc(url || attachment.get('url'), this.scene.requestRenderAll.bind(this.scene));
			shape.wpSize = size;
		} else {
			attachment.fetch().then(() => {
				const url = attachment.get('sizes') && attachment.get('sizes')[$(e.target).val()]?.url;
				shape.setSrc(url || attachment.get('url'), this.scene.requestRenderAll.bind(this.scene));
				shape.wpSize = size;
			});
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_replaceImage(e){
		e.preventDefault();
		const shape = this._getSelectedShape();
		if (shape.type !== 'image'){
			return;
		}
		if (!this.__mediaFrame){
			this.__mediaFrame = media({
				multiple:false,
				library:{
					type:'image'
				}
			});
			this.__mediaFrame
			.on('select', () => {
				const attachment = this.__mediaFrame.state().get('selection').first().toJSON();
				const url = attachment.sizes && attachment.sizes[shape.wpSize]?.url;
				shape.setSrc(url || attachment.url, this.scene.requestRenderAll.bind(this.scene));
				shape.wpId = attachment.id;
			})
			.on('open', () => {
				if (shape.wpId){
					this.__mediaFrame.state()?.get('selection')?.add(media.attachment(shape.wpId));
				}
			});
		}
		this.__mediaFrame.open();
	},

	/**
	 *
	 * @since 1.1.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setFillType(e){
		const fillType = $(e.target).val();
		this._setColorType('fill', fillType);
	},

	/**
	 *
	 * @since 1.1.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setStrokeType(e){
		const strokeType = $(e.target).val();
		this._setColorType('stroke', strokeType);
	},

	/**
	 *
	 * @since 1.1.0
	 * @access private
	 * @param {string} colorName Stroke, or fill.
	 * @param {string} colorType 'color', 'linear', or 'radial'
	 */

	_setColorType(colorName = 'fill', colorType = 'color'){

		
		const shape = this._getSelectedShape();
		const shapeModel = this._getSelectedShapeModel();
		const colorProp = shapeModel?._properties?.get(colorName);
		const hasColor = (colorProp && colorProp._transitions.length);
		const setColor = () => {
			switch (colorType){
				case 'color':
				shape[colorName] = colorName === 'fill' ? DEFAULT_FILL_COLOR : DEFAULT_STROKE_COLOR;
				break;
				case 'linear':
				shape[colorName] = new Gradient({
					type:'linear',
					colorStops:[{
						color:DEFAULT_STROKE_COLOR,
						offset:0
					},{
						color:DEFAULT_FILL_COLOR,
						offset:1
					}]
				});
				break;
				case 'radial':
				shape[colorName] = new Gradient({
					type:'radial',
					colorStops:[{
						color:DEFAULT_STROKE_COLOR,
						offset:0
					},{
						color:DEFAULT_FILL_COLOR,
						offset:1
					}]
				});
				break;
				default:
				break;
			}
			if (hasColor){
				shapeModel._properties.remove(colorProp);
				if (shapeModel._properties.length === 0 && shape){
					this.anime.remove(shape._animationCache);
					this.setState('totalDuration', this.anime.duration / 1000);
				}
			}
			this.scene.requestRenderAll();
			this.render();
		};

		if (!hasColor){
			setColor();
			return;
		}

		this.sendNotice(
			__('Are you sure? If you change the fill type, the fill animation will be deleted.', 'wpgraphicator'),
			'warning',
			setColor,
			this.render.bind(this)
		);

	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_setNonAnimatableStringValue(e){
		const target = $(e.target);
		const property = target.data('property');
		const val = target.val();
		const value = val === 'true' ? true : val === 'false' ? false : val;
		const shape = this._getSelectedShape();
		const shapeModel = this._getSelectedShapeModel();
		shape.saveState();
		shape.set(property, value);
		this.scene.requestRenderAll();
		shapeModel.trigger('wpg:pushtohistorystack', shapeModel, 'change', shape);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_addToStream(e){
		e.preventDefault();
		const target = $(e.target);
		const property = target.data('property') || target.parent().data('property');
		const shape = this._getSelectedShape();
		if (shape?.type === 'activeSelection'){
			const shapeModels = this._getSelectedShapeModels();
			each(shapeModels, model => {
				const object = this.scene.getObjectById(model.get('id'));
				if (!object){
					return;
				}
				const matrix = object.calcTransformMatrix();
				const transform = qrDecompose(matrix);
				const {
					translateX,
					translateY
				} = transform;
				let value;
				switch (property){
					case 'left':
					value = translateX;
					break;
					case 'top':
					value = translateY;
					break;
					case 'angle':
					case 'scaleX':
					case 'scaleY':
					case 'skewX':
					case 'skewY':
					value = transform[property];
					break;
					default:
					value = object[property];
					break;
				}
				this.__updateProperty(model, property, value, undefined, true);
			});
			this.shapes.trigger('wpg:pushtohistorystack', shapeModels, 'bulk:change', shape._objects);
			return;
		}
		const shapeModel = this._getSelectedShapeModel();
		let value;
		switch (property){
			case 'fill':
			case 'stroke':
			if (shape[property] && shape[property].toLive){ // In case of gradient.
				value = serializeGradient(shape[property]);
			} else { // In case of color.
				value = shape[property];
			}
			break;
			case 'path':
			value = serializePath(shape.path);
			break;
			case 'points':
			value = serializePoints(shape.points);
			break;
			case 'strokeDashArray':
			value = isArray(shape.strokeDashArray) ? shape.strokeDashArray.join(' ') : '0 0';
			break;
			default:
			value = shape[property];
			break;
		}
		this.__updateProperty(shapeModel, property, value, undefined, true);
	},

	/**
	 *
	 * @since 1.0.0
	 */

	__updateProperty:Project.prototype.__updateProperty

});
