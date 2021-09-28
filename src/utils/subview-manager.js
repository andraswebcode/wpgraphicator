import $ from 'jquery';
import {
	Events
} from 'backbone';
import {
	extend,
	isArray,
	each,
	findWhere,
	without,
	sortBy
} from 'underscore';

/**
 * Subview manager.
 * @since 1.0.0
 * @class
 */

class SubviewManager {

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @param {object} viewOptions
	 * @param {object} $
	 */

	constructor(viewOptions = {}, $){
		this.$ = $;
		this.viewOptions = viewOptions;
		this._registeredViews = [];
		this.views = {};
	}

	/**
	 * Register subview.
	 * @since 1.0.0
	 * @param {object} view
	 */

	add(view = {}){
		const renderOnChange = view.renderOnChange || [];
		const eventName = renderOnChange.map(e => `change:${e}`).join(' ');
		view.name = view.view && view.view.prototype.name;
		this._registeredViews.push(view);
		if (view.name && view.collection){ // In case of collection.
			this.views[view.name] = [];
			each(view.collection.toArray(), this._addView(view));
			this.listenTo(view.collection, 'add', this._addView(view));
			this.listenTo(view.collection, 'remove', this._removeView(view));
			this.listenTo(view.collection, 'sort', this._sortViews(view));
			if (renderOnChange.length){
				this.listenTo(view.collection, eventName, () => this.render(view.name));
			}
		} else if (view.name && view.model){ // In case of single model.
			this.views[view.name] = new view.view(extend({
				model:view.model
			}, this.viewOptions));
			if (renderOnChange.length){
				this.listenTo(view.model, eventName, () => this.render(view.name));
			}
			this.render(view.name);
		}
	}

	/**
	 * Get view by cid.
	 * @since 1.0.0
	 * @param {string} viewName Name of registered view.
	 * @param {string} cid Backbone.View cid.
	 * @return {object|undefined} Backbone.View instance if it is found.
	 */

	getByCid(viewName, cid){
		if (!cid){
			return;
		}
		return findWhere(this.views[viewName], {cid});
	}

	/**
	 * Render.
	 * @since 1.0.0
	 * @param {string} viewName
	 * @return {object} This object.
	 */

	render(viewName){
		const views = this.views[viewName];
		if (!viewName || !views){
			return this;
		}
		const wrapper = this.$('.wpg-subview__' + viewName);
		if (isArray(views)){ // In case of collection.
			each(views, view => {
				view.undelegateEvents();
				view.render().$el.appendTo(wrapper);
				view.delegateEvents();
			});
		} else { // In case of single model.
			views.undelegateEvents();
			views.render().$el.appendTo(wrapper);
			views.delegateEvents();
		}
		return this;
	}

	/**
	 * Render all registered subview.
	 * @since 1.0.0
	 * @return{object} This object.
	 */

	renderAll(){
		each(this.views, (views, name) => this.render(name));
		return this;
	}

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_addView({view, name}){
		return model => {
			const views = new view(extend({
				model
			}, this.viewOptions));
			this.views[name].push(views);
			//this.render(name);
			const wrapper = this.$('.wpg-subview__' + name);
			views.undelegateEvents();
			views.render().$el.appendTo(wrapper);
			views.delegateEvents();
		};
	}

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_removeView({name}){
		return model => {
			const view = findWhere(this.views[name], {
				model
			});
			if (view){
				view.remove();
				this.views[name] = without(this.views[name], view);
			}
		};
	}

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {object}
	 */

	_sortViews({name}){
		return (collection, {add}) => {
			this.views[name] = sortBy(this.views[name], view => view.model.get(collection.comparator));
			if (!add){
				this.render(name);
			}
		};
	}

}

/**
 * Add Backbone events to SubviewManager.prototype.
 * @since 1.0.0
 */

extend(SubviewManager.prototype, Events);

export default SubviewManager;
