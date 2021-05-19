import {
	Shadow,
	util
} from 'fabric';
import {
	times,
	random
} from 'underscore';

util.object.extend(Shadow.prototype, {
	initialize(options){
		if (typeof options === 'string') {
			options = this._parseShadow(options);
		}
		for (var prop in options) {
			this[prop] = options[prop];
		}
		const id = times(20, () => random(36).toString(35)).join('');
		this.id = `wpgraphicator-filter-${id}`;
	}
});
