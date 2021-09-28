import {
	Model
} from 'backbone';
import {
	extend,
	debounce
} from 'underscore';

import Transitions from './transitions.js';

/**
 * Property model.
 * @since 1.0.0
 * @class
 * @augments Backbone.Model
 */

export default Model.extend(/** @lends Property.prototype */{

	/**
	 * Model defaults.
	 * @since 1.0.0
	 * @var {object}
	 */

	defaults:{
		id:'', // The name of the property, eg.: scaleX, top, etc.
		shapeId:'',
		transitions:[]
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this._transitions = new Transitions();
		// Trigger 'add' to create anime timeline on load project.
		// @see view/subview-timeline-track.js TimlineTrack.protoype.initialize()
		this._transitions.add(this.get('transitions'));
		this.on('change:transitions', (model, transitions) => this._transitions.set(transitions));
		// Trigger 'wpg:pushtohistorystack' for history manager.
		this.listenTo(this._transitions, 'add change remove', debounce(() => this.trigger('wpg:pushtohistorystack'), 400, true));
	},

	/**
	 *
	 * @since 1.0.0
	 * @return {object}
	 */

	toJSON(){
		return extend(
			Model.prototype.toJSON.call(this), {
				transitions:this._transitions.toJSON()
			}
		);
	}

});
