import {
	Object as FabricObject,
	ActiveSelection,
	Group,
	util
} from 'fabric';
import {
	sortBy
} from 'underscore';

import {
	ACTIVE_SELECTION_DASH_ARRAY
} from './../utils/constants.js';

util.object.extend(ActiveSelection.prototype, {
	hasControls:false,
	borderDashArray:ACTIVE_SELECTION_DASH_ARRAY,
	/**
	 * Extend fabric.ActiveSelection.prototype.toGroup()
	 * @since 1.2.0
	 */
	toGroup(){
		// Need sortBy zIndex to keep order of objects.
		var objects = sortBy(this._objects, 'zIndex');
		this._objects = [];
		var options = FabricObject.prototype.toObject.call(this);
		var newGroup = new Group([]);
		delete options.type;
		newGroup.set(options);
		objects.forEach(object => {
			object.canvas.remove(object);
			object.group = newGroup;
		});
		newGroup._objects = objects;
		if (!this.canvas){
			return newGroup;
		}
		var canvas = this.canvas;
		canvas.add(newGroup);
		canvas._activeObject = newGroup;
		newGroup.setCoords();
		return newGroup;
	}
});
