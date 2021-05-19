import {
	Circle,
	util
} from 'fabric';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(Circle.prototype, {
	/**
	 * Extend fabric.Circle.prototype.stateProperties
	 * @since 1.0.0
	 */
	stateProperties:stateProperties.concat(['radius'])
});
