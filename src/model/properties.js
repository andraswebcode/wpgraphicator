import {
	Collection
} from 'backbone';
import {
	reduce,
	min,
	clone,
	isObject
} from 'underscore';

import Property from './property.js';

/**
 * Properties collection.
 * @since 1.0.0
 * @class
 * @augments Backbone.Collection
 */

export default Collection.extend(/** @lends Properties.prototype */{

	/**
	 * The model of this collection.
	 * @since 1.0.0
	 * @var {object}
	 */

	model:Property,

	/**
	 * Create keyframes for anime timeline.
	 * @since 1.0.0
	 * @return {object}
	 */

	toAnime(){
		const json = this.toJSON();
		if (!json.length){
			return {};
		}
		return reduce(json, (res, prop) => {
			let first = min(prop.transitions, 'second');
			let tl = prop.transitions;
			if (isObject(first) && first.second !== 0){
				first = clone(first);
				first.second = 0;
				tl = [first].concat(tl);
			}
			res[prop.id] = tl.map(({second, value, easing}, i) => ({
				easing,
				duration:i === 0 ? second * 1000 : (second - tl[i - 1].second) * 1000,
				value
			}));
			return res;
		}, {});
	}

});
