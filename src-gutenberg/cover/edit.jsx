import {
	RawHTML
} from '@wordpress/element';

import {
	AlignmentToolbar,
	BlockControls,
	InnerBlocks
} from '@wordpress/block-editor';

import {
	ToolbarGroup,
	ToolbarButton,
	ResizableBox
} from '@wordpress/components';

import {
	__
} from '@wordpress/i18n';

import {
	withSelect
} from '@wordpress/data';

import classnames from 'classnames';

import Inspector from './inspector.jsx';

import {
	createAdditionalAttrs
} from './../utils.js';

const CoverEdit = ({
	attributes,
	setAttributes,
	className,
	svgContent,
	hasChildren
}) => {

	const {
		ref,
		textAlign,
		minHeight,
		preserveAspectRatio,
		overlayColor,
		overlayGradient,
		overlayOpacity
	} = attributes;

	const selectProject = () => {
		if (!window.wpgModal){
			return;
		}
		window.wpgModal().open().once('select', project => setAttributes({
			ref:project.id
		}));
	};
	const hasOverlay = !!(overlayColor || overlayGradient);

	return [
		<Inspector
			key='inspector'
			attributes={attributes}
			setAttributes={setAttributes} />,
		<BlockControls key='controls'>
			<AlignmentToolbar
				value={textAlign}
				onChange={textAlign => setAttributes({textAlign})} />
			<ToolbarGroup>
				<ToolbarButton
					label={__('Select a Project', 'gutenpb')}
					icon='format-image'
					onClick={selectProject} />
			</ToolbarGroup>
		</BlockControls>,
		<ResizableBox
			key='content'
			onResize={(e, dir, el) => setAttributes({
				minHeight:`${el.clientHeight}px`
			})}
			minHeight={50}
			maxHeight={1000}
			enable={{
				bottom:true
			}} >
			<div
				className={classnames(className, {
					[`has-text-align-${textAlign}`]:textAlign
				})}
				style={{
					minHeight:minHeight
				}} >
				{RawHTML({
					className:'wp-block-wpgraphicator-cover__svg-wrapper',
					children:createAdditionalAttrs(svgContent, {
						preserveAspectRatio
					})
				})}
				{hasOverlay && (
					<span
						className='wp-block-wpgraphicator-cover__overlay'
						style={{
							backgroundColor:overlayColor,
							backgroundImage:overlayGradient,
							opacity:overlayOpacity
						}} >
					</span>
				)}
				<div className='wp-block-wpgraphicator-cover__inner-blocks'>
					<InnerBlocks
						template={[
							['core/heading'],
							['core/paragraph']
						]}
						renderAppender={hasChildren ? false : () => <InnerBlocks.ButtonBlockAppender />} />
				</div>
			</div>
		</ResizableBox>
	];

};

export default withSelect((select, {attributes, clientId}) => {
	const id = attributes.ref;
	const {
		getEntityRecord
	} = select('core');
	const {
		getBlockOrder
	} = select('core/block-editor');
	const project = getEntityRecord('postType', 'wpgraphicator', id);
	const svgContent = project && project.content && project.content.raw;
	const hasChildren = getBlockOrder(clientId).length > 0;
	return {
		svgContent,
		hasChildren
	};
})(CoverEdit);
