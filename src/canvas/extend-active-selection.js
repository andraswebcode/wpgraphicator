import {
	Object as FabricObject,
	ActiveSelection,
	util
} from 'fabric';
import {
	ACTIVE_SELECTION_DASH_ARRAY
} from './../utils/constants.js';

util.object.extend(ActiveSelection.prototype, {
	hasControls:false,
	borderDashArray:ACTIVE_SELECTION_DASH_ARRAY
});
