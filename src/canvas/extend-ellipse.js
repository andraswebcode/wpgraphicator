import {
	Ellipse,
	util
} from 'fabric';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(Ellipse.prototype, {
	/**
	 * Extend fabric.Ellipse.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['rx', 'ry'])
});
