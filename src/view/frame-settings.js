import $ from 'jquery';
import {
	contains,
	without
} from 'underscore';

import Frame from './frame.js';
import SettingsProject from './subview-settings-project.js';
import SettingsStats from './subview-settings-stats.js';
import SettingsLayer from './subview-settings-layer.js';
import SettingsShape from './subview-settings-shape.js';

/**
 * Settings frame.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Frame
 * @augments Backbone.View
 */

export default Frame.extend(/** @lends Settings.prototype */{

	/**
	 * The name of the view.
	 * @since 1.0.0
	 * @var {string}
	 */

	name:'settings',

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'click .wpg-tab__title':'_setActiveSettingsTabs'
	},

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.views.add({
			view:SettingsProject,
			model:this.state,
			renderOnChange:['projectName', 'projectWidth', 'projectHeight', 'seconds', 'projectID']
		});
		this.views.add({
			view:SettingsStats,
			model:this.state,
			renderOnChange:['pointerPosition', 'selectedShapeIds', 'totalDuration']
		});
		this.views.add({
			view:SettingsLayer,
			collection:this.shapes,
			renderOnChange:['name']
		});
		this.views.add({
			view:SettingsShape,
			model:this.state,
			renderOnChange:['selectedShapeIds']
		});
		this._toggleActiveTabsClass(this.state, this.getState('activeSettingsTabs'));
		this.listenTo(this.state, 'change:activeSettingsTabs', this._toggleActiveTabsClass);
	},

	_setActiveSettingsTabs(e){
		const target = $(e.target);
		const id = target.closest('.wpg-tab').attr('id');
		let activeSettingsTabs = this.getState('activeSettingsTabs').slice();
		if (contains(activeSettingsTabs, id)){
			activeSettingsTabs = without(activeSettingsTabs, id);
		} else {
			activeSettingsTabs.push(id);
		}
		this.setState('activeSettingsTabs', activeSettingsTabs);
	},

	_toggleActiveTabsClass(state, activeSettingsTabs){
		this.$('.wpg-tab').each(function(i, elem) {
			const tab = $(elem);
			const id = tab.attr('id');
			const has = contains(activeSettingsTabs, id);
			tab.toggleClass('active', has);
			tab.find('.wpg-tab__title .wpg-button')
			.attr('aria-expanded', `${has}`);
			tab.find('.wpg-tab__title .wpg-button i')
			.attr('class', `fas fa-angle-${has ? 'up' : 'down'}`);
		});
	}

});
