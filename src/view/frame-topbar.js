import Frame from './frame.js';
import TopbarMenu from './subview-topbar-menu.js';
import TopbarSave from './subview-topbar-save.js';
import Notification from './subview-notification.js';

/**
 * Topbar frame.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Frame
 * @augments Backbone.View
 */

export default Frame.extend(/** @lends Topbar.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'topbar',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-topbar-save-button':'_showLoader'
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:TopbarMenu,
			model:this.state,
			renderOnChange:['topbarMenuActiveDropdown', 'topbarMenuShowModal', 'projectID']
		});
		this.views.add({
			view:TopbarSave,
			model:this.state,
			renderOnChange:[]
		});
		this.views.add({
			view:Notification,
			collection:this.notifications
		});
		this.listenTo(this.project, 'sync', this._hideLoader);
	},

	_showLoader(){
		this.$('.wpg-topbar__loader').show();
	},

	_hideLoader(){
		setTimeout(() => {
			this.$('.wpg-topbar__loader').hide();
		}, 20);
	}

});
