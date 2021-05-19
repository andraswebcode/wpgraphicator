import $ from 'jquery';
import {
	extend,
	pick,
	result
} from 'underscore';
import {
	template
} from 'wordpress';

import Base from './base.js';
import SubviewManager from './../utils/subview-manager.js';

/**
 * Subview view.
 * @since 1.0.0
 * @class
 * @abstract
 * @augments Base
 * @augments Backbone.View
 */

export default Base.extend(/** @lends Subview.prototype */{

	/**
	 * Define class name for the view.
	 * @since 1.0.0
	 * @return {string}
	 */

	className(){
		return this.name && 'wpg-' + this.name;
	},

	/**
	 * Here you can register additional params to underscore template
	 * besides of common params.
	 * @since 1.0.0
	 * @var {object}
	 */

	templateParams:{},

	/**
	 * Preinitialize.
	 * @since 1.0.0
	 * @constructs
	 */

	preinitialize(options = {}){
		Base.prototype.preinitialize.call(this);
		extend(this, pick(options, this._viewOptions));
		if (this.name){
			const tmpl = $('#tmpl-wpg-subview__' + this.name);
			if (tmpl.length){
				this.template = template('wpg-subview__' + this.name);
			}
		}
		this.views = new SubviewManager(this.getViewOptions(), this.$.bind(this));
		this._bindBodyEvents();
	},

	/**
	 * Render subview.
	 * @since 1.0.0
	 * @return {object}
	 */

	render(){
		if (this.template){
			this.$el.html(
				this.template(
					extend(
						result(this, 'templateParams', {}),{
							state:this.state.toJSON(),
							model:this.model.toJSON()
						}
					)
				)
			);
		}
		this.views.renderAll();
		this._initPlugins();
		return this;
	},

	/**
	 *
	 * @since 1.0.0
	 * @access protected
	 */

	_initPlugins(){}

});
