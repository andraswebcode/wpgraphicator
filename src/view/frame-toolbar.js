import Frame from './frame.js';
import ToolbarButtons from './subview-toolbar-buttons.js';

/**
 * Toolbar frame.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Frame
 * @augments Backbone.View
 */

export default Frame.extend(/** @lends Toolbar.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'toolbar',

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:ToolbarButtons,
			model:this.state,
			renderOnChange:['activeTool', 'selectedShapeIds']
		});
	}

});
