import {
	Line,
	util
} from 'fabric';
import {
	stateProperties
} from './../utils/utils.js';

util.object.extend(Line.prototype, {
	stateProperties:stateProperties.concat(['x1', 'x2', 'y1', 'y2']),
	/**
	 * Extend fabric.Circle.prototype._setWidthHeight()
	 * @since 1.0.0
	 */
	/*_setWidthHeight(options = {}){
		this.width = Math.abs(this.x2 - this.x1);
		this.height = Math.abs(this.y2 - this.y1);
		if (options.left){
			this.left = options.left;
		}
		if (options.top){
			this.top = options.top;
		}
	}*/
});
