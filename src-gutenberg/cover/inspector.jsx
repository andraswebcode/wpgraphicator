import {
	Fragment
} from '@wordpress/element';

import {
	InspectorControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	ExternalLink,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import {
	__
} from '@wordpress/i18n';

import {
	playingModes,
	repeats,
	preserveAspectRatioValues
} from './../utils.js';

const Inspector = ({
	attributes:{
		repeat,
		direction,
		play,
		offset,
		preserveAspectRatio,
		minHeight,
		overlayColor,
		overlayGradient,
		overlayOpacity
	},
	setAttributes
}) => (
	<InspectorControls>
		<PanelBody
			title={__('Animation Settings', 'wpgraphicator')}
			initialOpen >
			<SelectControl
				label={__('Repeat', 'wpgraphicator')}
				help={__('The number of iterations of the animation.', 'wpgraphicator')}
				value={repeat}
				options={repeats}
				onChange={repeat => setAttributes({repeat})} />
			<SelectControl
				label={__('Direction', 'wpgraphicator')}
				help={__('Direction of the animation: normal means that animation progress goes from 0% to 100%, reverse means that progress goes from 100% to 0%, and alternate means that the progress goes from 0% to 100% and then goes back to 0%.', 'wpgraphicator')}
				value={direction}
				options={[{
					label:__('Normal', 'wpgraphicator'),
					value:'normal'
				},{
					label:__('Reverse', 'wpgraphicator'),
					value:'reverse'
				},{
					label:__('Alternate', 'wpgraphicator'),
					value:'alternate'
				}]}
				onChange={direction => setAttributes({direction})} />
			<SelectControl
				label={__('Playing Mode', 'wpgraphicator')}
				help={__('Define the action of how the animation begins to play.', 'wpgraphicator')}
				value={play}
				options={playingModes}
				onChange={play => setAttributes({play})} />
			<RangeControl
				label={__('Offset', 'wpgraphicator')}
				help={__('Trigger animation when the top of the element hits x percentage of the window height. 0% means animation starts at the top of the window, 100% means it starts at the bottom.', 'wpgraphicator')}
				value={offset}
				onChange={offset => setAttributes({offset})}
				allowReset
				min={0}
				max={100}
				step={1} />
		</PanelBody>
		<PanelBody
			title={__('SVG Settings', 'wpgraphicator')}
			initialOpen={false} >
			<SelectControl
				label={__('Preserve Aspect Ratio', 'wpgraphicator')}
				help={(
					<Fragment>
						{__('The preserveAspectRatio attribute indicates how an element with a viewBox providing a given aspect ratio must fit into a viewport with a different aspect ratio.', 'wpgraphicator')}
						<ExternalLink href='https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio'>
							{__('Learn more about preserveAspectRatio.')}
						</ExternalLink>
					</Fragment>
				)}
				value={preserveAspectRatio}
				options={preserveAspectRatioValues}
				onChange={preserveAspectRatio => setAttributes({preserveAspectRatio})} />
		</PanelBody>
		{!!UnitControl && ( // Check if unit control is exists, because it is an experimental control.
			<PanelBody
				title={__('Cover Settings', 'wpgraphicator')}
				initialOpen={false} >
				<UnitControl
					label={__('Minimum Height of Cover', 'wpgraphicator')}
					value={minHeight}
					onChange={minHeight => setAttributes({minHeight})} />
			</PanelBody>
		)}
		{!!PanelColorGradientSettings && ( // ...as well.
			<PanelColorGradientSettings
				title={__('Overlay', 'wpgraphicator')}
				initialOpen={false}
				settings={[{
					label:__('Color', 'wpgraphicator'),
					colorValue:overlayColor,
					gradientValue:overlayGradient,
					onColorChange:overlayColor => setAttributes({overlayColor}),
					onGradientChange:overlayGradient => setAttributes({overlayGradient})
				}]} >
				{!!(overlayColor || overlayGradient) && (
					<RangeControl
						label={__('Opacity', 'wpgraphicator')}
						value={overlayOpacity}
						onChange={overlayOpacity => setAttributes({overlayOpacity})}
						min={0}
						max={1}
						step={0.1} />
				)}
			</PanelColorGradientSettings>
		)}
	</InspectorControls>
);

export default Inspector;
