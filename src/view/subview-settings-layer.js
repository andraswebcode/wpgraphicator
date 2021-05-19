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
			shapeName:shapeNames[this.model.get('type')]
		};
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.listenTo(this.state, 'change:selectedShapeIds', this._toggleActiveClass);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} state
	 * @param {array} selectedShapeIds
	 */

	_toggleActiveClass(state, selectedShapeIds){
		this.$el.toggleClass('active', contains(selectedShapeIds, this.model.get('id')));
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_moveLayer(e){
		e.preventDefault();
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
