import $ from 'jquery';
import {
	isArray,
	isString
} from 'underscore';
import {
	toFixed
} from './utils.js';

const bg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAAHnlligAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNpi+P///4EDBxiAGMgCCCAGFB5AADGCRBgYDh48CCRZIJS9vT2QBAggFBkmBiSAogxFBiCAoHogAKIKAlBUYTELAiAmEtABEECk20G6BOmuIl0CIMBQ/IEMkO0myiSSraaaBhZcbkUOs0HuBwDplz5uFJ3Z4gAAAABJRU5ErkJggg==';
const css = '.gradient-picker-color-result{background:url(' + bg + ');}.iris-picker .iris-square, .iris-picker .gradient-picker-saturation-strip{margin-right:5%;}';
const container = '<div class="gradient-picker" />';
const wrap = '<div class="gradient-picker-wrap" />';
const alphaStrip = '<div class="iris-slider iris-strip gradient-picker-alpha-strip"><div class="iris-slider-offset"></div></div>';

Color.fn.toString = function() {

	if (this._alpha < 1){
		return this.toCSS('rgba', this._alpha).replace(/\s+/g, '');
	}

	let hex = parseInt(this._color, 10).toString(16);

	if (this.error){
		return '';
	}
	if (hex.length < 6){
		for (let i = 6 - hex.length - 1; i >= 0; i--){
			hex = '0' + hex;
		}
	}

	return '#' + hex;

};

const Picker = {
	options:{
		width:255,
		alpha:true,
		hide:false,
		border:false,
		palettes:true,
		mode:'hsv'
	},
	_inited:0,
	_create:function() {

		const self = this,
			options = self.options,
			el = self.element;

		self._super();

		self.controls.strip.addClass('gradient-picker-saturation-strip');

		if (options.alpha){
			self._createAlphaStrip();
		}
		self._initControls();
		self._dimensions();
		self._change();

	},
	_dimensions:function() {

		this._super();

		const self = this,
			opts = self.options,
			controls = self.controls,
			strip = controls.strip,
			alphaStrip = controls.alphaStrip,
			totalPadding = 20,
			innerWidth = opts.width - totalPadding;
		let stripWidth = '6%';

		if (alphaStrip){
			stripWidth = innerWidth * (parseFloat(stripWidth) / 100);
			strip.width(stripWidth);
			alphaStrip.width(stripWidth);
		}

	},
	_addInputListeners:function(input) {

		const self = this,
			debounceTimeout = 100,
			callback = function(e) {
				const color = new Color(input.val()),
					val = input.val();
				input.removeClass('iris-error');
				if (color.error){
					if (val !== ''){
						input.addClass('iris-error');
					}
				} else {
					if (color.toString() !== self._color.toString()){
						if (e.type !== 'keyup'){
							self._setOption('color', color.toString());
						}
					}
				}
			};

		input.on('change', callback).on('keyup', self._debounce(callback, debounceTimeout));

	},
	_initControls:function() {

		this._super();

		const self = this,
			controls = self.controls,
			opts = self.options;

		if (controls.alphaStrip){
			controls.alphaStripSlider.slider({
				orientation:'vertical',
				min:0,
				max:1,
				step:0.01,
				value:self._color._alpha,
				slide:function(e, ui) {
					self.active = 'alphaStrip';
					self._color._alpha = parseFloat(ui.value);
					self._change.apply(self, arguments);
				}
			});
		}

	},
	_change:function() {

		const self = this,
			controls = self.controls,
			color = self._getHSpaceColor(),
			controlOpts = self.options.controls,
			type = controlOpts[self.active] || 'external',
			oldHue = self.hue;
		let actions = ['square', 'strip', 'alpha'];

		if (self.active === 'strip' || self.active === 'alphaStrip'){
			actions = [];
		}

		if (self.active !== 'external'){
			actions = ['square'];
		}

		$.each(actions, function(i, item) {
			let value, dimensions, cssObj;
			if (item !== self.active){
				switch (item){
					case 'square':
						dimensions = self._squareDimensions();;
						self.controls.squareDrag.css({
							left: color[controlOpts.horiz] / self._scale[controlOpts.horiz] * dimensions.w,
							top: dimensions.h - (color[controlOpts.vert] / self._scale[controlOpts.vert] * dimensions.h)
						});
					break;
					case 'strip':
						value = (controlOpts.strip === 'h') ? self._scale[controlOpts.strip] - color[controlOpts.strip] : color[controlOpts.strip];
						controls.stripSlider.slider('value', value);
					break;
					case 'alpha':
					if (controls.alphaStrip){
						controls.alphaStripSlider.slider('value', self._color._alpha);
					}
					break;
				}
			}
		});

		if (color.h !== oldHue && self._isNonHueControl(self.active, type)) {
			self._color.h(oldHue);
		}

		self.hue = self._color.h();
		self.options.color = self._color.toString();

		const ui = {
			color: self._color
		};

		if (self._inited === 2) {
			self._trigger('change', {type: self.active}, ui);
		}

		if (!self._color.error) {
			self.element.removeClass('iris-error');
			if (self.element.val() !== self._color.toString()) {
				self.element.val(self._color.toString());
			}
		}

		self._paint();
		if (self._inited < 2){
			self._inited++;
		}
		self.active = false;

	},
	_paint:function() {

		this._super();

		const self = this;
		const controls = self.controls;
		let color = self._color.toRgb();
			color = color.r + ',' + color.g + ',' + color.b;
		const gradient = 'rgb(' + color + '), rgba(' + color + ',0)';
		const alpha = self._color._alpha;
		const buttonColor = (self._color.v() < 50 && self._color._alpha >= 0.5) ? '#fff' : '#000';

		if (controls.alphaStrip){
			controls.alphaStrip.css('background', 'linear-gradient(to bottom, ' + gradient + '), url(' + bg + ')');
		}

	},
	_createAlphaStrip:function() {

		const self = this,
			container = self.picker.find('.iris-picker-inner');

		container.append(alphaStrip);
		self.controls.alphaStrip = self.picker.find('.gradient-picker-alpha-strip');
		self.controls.alphaStripSlider = self.picker.find('.gradient-picker-alpha-strip .iris-slider-offset');

	}
};

$.widget('wpg.colorPicker', $.a8c.iris, Picker);
$('<style id="gradient-picker-css">' + css + '<style>').appendTo('head');

const Slider = {
	options:{
		min:0,
		max:200,
		step:1
	},
	_create:function() {
		const self = this;
		self._super();
		self.handle.text(self.value());
	},
	_change:function(event, index) {
		const self = this;
		self._superApply(event, index);
		self.handle.text(self.value());
	}
};

$.widget('wpg.rangeSlider', $.ui.slider, Slider);

const arrayItem = '<div class="wpg-input-wrapper"><input type="number" class="wpg-input" min="0" /><input type="number" class="wpg-input" min="0" /><button class="wpg-stroke-dash-array-control__remove-item-button wpg-button"><i class="fas fa-times"></i></button></div>';
const addItemButton = '<button class="wpg-stroke-dash-array-control__add-item-button wpg-button"></button>';
const labelElements = '<div class="wpg-stroke-dash-array-control__labels wpg-input-wrapper"><small class="wpg-stroke-dash-array-control__dash-label"></small><small class="wpg-stroke-dash-array-control__gap-label"></small></div>';

const StrokeDashArray = {
	options:{
		labels:{
			addValue:'',
			dashes:'',
			gaps:''
		},
		value:'',
		change:null
	},
	_create(){
		const self = this;
		const value = self.options.value;
		const labels = self.options.labels;
		this._value = isArray(value) ? value.slice() : isString(value) ? value.split(' ') : [];
		self.labelElements = $(labelElements).appendTo(self.element);
		self.addItemButton = $(addItemButton).text(labels.addValue).appendTo(self.element);
		self.labelElements.find('.wpg-stroke-dash-array-control__dash-label').text(labels.dashes);
		self.labelElements.find('.wpg-stroke-dash-array-control__gap-label').text(labels.gaps);
		for (var i = 0; i < this._value.length; i += 2){
			this._addItem(this._value[i], this._value[i + 1]);
		}
		self.addItemButton.on('click', function(e) {
			e.preventDefault();
			self._addItem(0, 0);
			self._changeValue(e)
		});
		self.element.on('click', '.wpg-stroke-dash-array-control__remove-item-button', function(e) {
			e.preventDefault();
			$(this).parent().remove();
			self._changeValue(e);
		});
		self.element.on('change', '.wpg-input', self._changeValue.bind(self));
	},
	_addItem(valueEven, valueOdd){
		const self = this;
		const item = $(arrayItem);
		item.find('.wpg-input').first().val(valueEven);
		item.find('.wpg-input').last().val(valueOdd || valueEven);
		item.insertBefore(self.addItemButton);
	},
	_changeValue(e){
		const self = this;
		const values = [];
		self.element.find('.wpg-input').each(function() {
			const val = toFixed($(this).val());
			values.push(val);
		});
		const value = values.join(' ');
		this._trigger('change', e, {
			value
		});
	}
};

$.widget('wpg.strokeDashArrayControl', StrokeDashArray);

const shadowOffsetX = '<div class="wpg-input-wrapper"><span class="wpg-label">OFFSETX</span><div class="wpg-shadow-control-offset-x wpg-range-slider"></div></div>';
const shadowOffsetY = '<div class="wpg-input-wrapper"><span class="wpg-label">OFFSETY</span><div class="wpg-shadow-control-offset-x wpg-range-slider"></div></div>';
const shadowBlur = '<div class="wpg-input-wrapper"><span class="wpg-label"></span><div class="wpg-shadow-control-offset-x wpg-range-slider"></div></div>';
const shadowColor = '<div class="wpg-input-wrapper"><label class="wpg-label"></label><input type="text" class="wpg-input"></div>';

const ShadowControl = {
	options:{
		labels:{
			offsetX:'',
			offsetY:'',
			blur:'',
			color:''
		},
		value:'',
		change:null
	},
	_create(){
		const self = this;
		const element = self.element;
		const options = self.options;
		const labels = options.labels;
		const values = options.value ? options.value.split(' ') : [0, 0, 0, '#000'];

		this._offsetXControl = $(shadowOffsetX).appendTo(element);
		this._offsetYControl = $(shadowOffsetY).appendTo(element);
		this._blurControl = $(shadowBlur).appendTo(element);
		this._colorControl = $(shadowColor).appendTo(element);

		this._offsetXControl.find('span').text(labels.offsetX);
		this._offsetYControl.find('span').text(labels.offsetY);
		this._blurControl.find('span').text(labels.blur);
		this._colorControl.find('label').text(labels.color);

		this._offsetXControl.find('.wpg-range-slider').rangeSlider({
			value:parseInt(values[0]) || 0,
			change:self._changeValue.bind(self)
		});
		this._offsetYControl.find('.wpg-range-slider').rangeSlider({
			value:parseInt(values[1]) || 0,
			change:self._changeValue.bind(self)
		});
		this._blurControl.find('.wpg-range-slider').rangeSlider({
			value:parseInt(values[2]) || 0,
			change:self._changeValue.bind(self)
		});
		this._colorControl.find('.wpg-input').colorPicker({
			width:150,
			color:values[3] || '#000',
			change:self._changeValue.bind(self)
		});

	},
	_changeValue(e){
		const self = this;
		const offsetX = self._offsetXControl.find('.wpg-range-slider').rangeSlider('value');
		const offsetY = self._offsetYControl.find('.wpg-range-slider').rangeSlider('value');
		const blur = self._blurControl.find('.wpg-range-slider').rangeSlider('value');
		const color = self._colorControl.find('.wpg-input').colorPicker('color');
		const value = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
		self._trigger('change', e, {
			value
		});
	}
};

$.widget('wpg.shadowControl', ShadowControl);
