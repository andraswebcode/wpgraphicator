import {
	Gradient,
	iMatrix,
	util
} from 'fabric';
import {
	times,
	random
} from 'underscore';

util.object.extend(Gradient.prototype, {
	/**
	 * Update default 'pixels' value to 'percentage'.
	 * @since 1.0.0
	 */
	gradientUnits:'percentage',
	/**
	 * Extend fabric.Gradient.prototype.initialize()
	 * @since 1.0.0
	 */
	initialize(options = {}){
		for (var prop in options) {
			this[prop] = options[prop];
		}
		const id = times(20, () => random(36).toString(35)).join('');
		this.id = `WPG_GRADIENT_ID-${id}`;
		if (this.type === 'linear'){
			this.coords = {
				x1:0,
				y1:0,
				x2:1,
				y2:0
			};
		} else if (this.type === 'radial'){
			this.coords = {
				x1:0.5,
				y1:0.5,
				x2:0.5,
				y2:0.5,
				r1:0,
				r2:0.5
			};
		}
		this.colorStops = (options.colorStops || []).slice()
	},
	/**
	 * Extend fabric.Gradient.prototype.toSVG()
	 * @since 1.0.0
	 */
	toSVG(object, options){
		const coords = this.coords;
		const transform = (this.gradientTransform || iMatrix).slice();
		const markup = [];
		const needsSwap = coords.r1 > coords.r2;
		let colorStops = this.colorStops.slice(), i, l;
		colorStops.sort((a, b) => (a.offset - b.offset));
		if (this.type === 'linear'){
			markup.push(
				'<linearGradient ',
				`id="${this.id}" `,
				'gradientUnits="objectBoundingBox" ',
				`gradientTransform="${util.matrixToSVG(transform)}" `,
				`x1="${coords.x1}" `,
				`y1="${coords.y1}" `,
				`x2="${coords.x2}" `,
				`y2="${coords.y2}" `,
				'>\n'
			);
		} else {
			markup.push(
				'<radialGradient ',
				`id="${this.id}" `,
				'gradientUnits="objectBoundingBox" ',
				`gradientTransform="${util.matrixToSVG(transform)}" `,
				`cx="${needsSwap ? coords.x1 : coords.x2}" `,
				`cy="${needsSwap ? coords.y1 : coords.y2}" `,
				`r="${needsSwap ? coords.r1 : coords.r2}" `,
				`fx="${needsSwap ? coords.x2 : coords.x1}" `,
				`fy="${needsSwap ? coords.y2 : coords.y1}" `,
				'>\n'
			);
		}
		if (this.type === 'radial'){
			if (needsSwap){
				colorStops = colorStops.concat();
				colorStops.reverse();
				for (i = 0, l = colorStops.length; i < l; i++){
					colorStops[i].offset = 1 - colorStops[i].offset;
				}
			}
			const minRadius = Math.min(coords.r1, coords.r2);
			if (minRadius > 0){
				const maxRadius = Math.max(coords.r1, coords.r2);
				const percentageShift = minRadius / maxRadius;
				for (i = 0, l = colorStops.length; i < l; i++){
					colorStops[i].offset += percentageShift * (1 - colorStops[i].offset);
				}
			}
		}
		for (i = 0, l = colorStops.length; i < l; i++){
			const stop = colorStops[i];
			markup.push(
				'<stop ',
				`offset="${stop.offset * 100}%" `,
				`stop-color="${stop.color}" `,
				stop.opacity !== undefined ? `stop-opacity="${stop.opacity}" ` : '',
				'/>\n'
			);
		}
		markup.push((this.type === 'linear' ? '</linearGradient>\n' : '</radialGradient>\n'));
		return markup.join('');
	}
});
