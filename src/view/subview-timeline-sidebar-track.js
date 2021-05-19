import Subview from './subview.js';
import {
	propertyNames,
	notificationMessages
} from './../utils/utils.js';

const {
	removeProperty
} = notificationMessages;

/**
 * Sidebar track subview.
 * @since 1.0.0
 * @class
 * @augments Subview
 * @augments Base
 * @augments Backbone.View
 */

export default Subview.extend(/** @lends SidebarTrack.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'timeline-sidebar-track',

	/**
	 * Delegated events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-remove-property-button':'_removeProperty'
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	templateParams(){
		return {
			propertyName:propertyNames[this.model.get('id')]
		};
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_removeProperty(e){
		e.preventDefault();
		const id = this.model.get('id');
		const shapeId = this.model.get('shapeId');
		const shape = this.scene.getObjectById(shapeId);
		const shapeModel = this.shapes.get(shapeId);
		if (shapeModel){
			this.sendNotice(
				removeProperty,
				'warning',
				() => {
					shapeModel._properties.remove(id);
					if (shapeModel._properties.length === 0 && shape){
						this.anime.remove(shape._animationCache);
						this.setState('totalDuration', this.anime.duration / 1000);
					}
				},
				true
			)
		}
	}

});
