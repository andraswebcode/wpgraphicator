import {
	__
} from '@wordpress/i18n';
import {
	times,
	map
} from 'lodash';

export const repeats = times(11, i => i === 10 ? {
	label:__('Infinity', 'wpgraphicator'),
	value:'infinity'
} : {
	label:i + 1,
	value:i + 1
});

export const playingModes = map(window.wpgBlocks ? window.wpgBlocks.playing_modes : {}, ({label}, value) => ({
	label,
	value
}));

export const preserveAspectRatioValues = map(window.wpgBlocks ? window.wpgBlocks.preserve_aspect_ratio_values : [], value => ({
	label:value,
	value
}));

export const createAdditionalAttrs = (svgString = '', {width, height, preserveAspectRatio}) => {
	const attrs = [
		'xmlns="http://www.w3.org/2000/svg"',
		'class="wpgraphicator"'
	];
	!!width && attrs.push(`width="${width}"`);
	!!height && attrs.push(`height="${height}"`);
	!!preserveAspectRatio && attrs.push(`preserveAspectRatio="${preserveAspectRatio}"`);
	return svgString.replace('xmlns="http://www.w3.org/2000/svg"', attrs.join(' '));
};
