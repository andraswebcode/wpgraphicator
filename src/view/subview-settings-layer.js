import $ from 'jquery';
import Subview from './subview.js';
import TimelineShape from './subview-timeline-shape.js';
import {
	shapeNames
} from './../utils/utils.js';
import {
	contains
} from 'underscore';

/**
 * Settings layer subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 * @mixes TimelineShape
 */

export default Subview.extend(/** @lends SettingsLayer.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'settings-layer',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-settings-layer__grip-button':'_setActiveShape',
		'click .wpg-settings-layer__move-button':'_moveLayer',
		'click .wpg-settings-layer__copy-button':'_copyShape',
		'click .wpg-remove-item-button':'_removeItem',
		'change input':'_changeShapeName'
	},

	/**
	 * Additional params for underscore template.
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		return {
			shapeName:shapeNames[this.model.get('type')],
			isMultiSelection:this._isMultiSelection.bind(this)
		};
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.state, 'change:selectedShapeIds', this._onChangeShapeIds);
		this.listenTo(this.model, 'change:zIndex', this._updateZIndex);
	},

	/**
	 *
	 * @since 1.2.0
	 * @access private
	 * @param {object} state
	 * @param {array} selectedShapeIds
	 */

	_onChangeShapeIds(state, selectedShapeIds){
		this.$el.toggleClass('active', contains(selectedShapeIds, this.model.get('id')));
		if (this._isMultiSelection()){
			this.$('.wpg-settings-layer__move-button').attr('disabled', true);
			this.$('.wpg-settings-layer__copy-button').attr('disabled', true);
		} else {
			this.$('.wpg-settings-layer__move-button').removeAttr('disabled');
			this.$('.wpg-settings-layer__copy-button').removeAttr('disabled');
		}
	},

	/**
	 *
	 * @since 1.2.0
	 * @access private
	 * @param {object} model
	 * @param {array} zIndex
	 */

	_updateZIndex(model, zIndex){
		const shape = this.scene.getObjectById(this.model.get('id')) || {};
		shape.zIndex = zIndex;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_moveLayer(e){
		e.preventDefault();
		if (this._isMultiSelection()){ // Disable move on multiselection.
			return;
		}
		const target = $(e.target);
		const layerWrapper = target.closest('.wpg-settings-layer');
		const direction = target.data('direction') || target.parent().data('direction');
		const shape = this.scene.getObjectById(this.model.get('id'));
		if (direction === 'down'){
			if (this.model.moveForward()){
				shape.bringForward();
			}
		} else {
			if (this.model.moveBackward()){
				shape.sendBackwards();
			}
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_copyShape(e){
		e.preventDefault();
		if (this._isMultiSelection()){ // Disable copy on multiselection.
			return;
		}
		const shape = this.scene.getObjectById(this.model.get('id'));
		shape.clone(newShape => {
			newShape.set({
				top:shape.top + 5,
				left:shape.left + 5
			});
			this.scene
			.discardActiveObject()
			.add(newShape)
			.setActiveObject(newShape);
		});
	},

	/**
	 *
	 * @since 1.2.0
	 * @access private
	 * @return {bool}
	 */

	_isMultiSelection(){
		return (this.getState('selectedShapeIds')?.length > 1);
	},

	/**
	 *
	 * @since 1.0.0
	 */

	_removeItem:TimelineShape.prototype._removeItem,

	/**
	 *
	 * @since 1.0.0
	 */

	_setActiveShape:TimelineShape.prototype._setActiveShape,

	/**
	 *
	 * @since 1.0.0
	 */

	_changeShapeName:TimelineShape.prototype._changeShapeName

});
