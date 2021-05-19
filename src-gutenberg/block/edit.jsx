import {
	RawHTML
} from '@wordpress/element';

import {
	BlockControls
} from '@wordpress/block-editor';

import {
	Placeholder,
	Button,
	ToolbarGroup,
	ToolbarButton
} from '@wordpress/components';

import {
	__
} from '@wordpress/i18n';

import {
	withSelect
} from '@wordpress/data';

import Inspector from './inspector.jsx';

import {
	createAdditionalAttrs
} from './../utils.js';

const BlockEdit = ({
	attributes,
	setAttributes,
	className,
	svgContent
}) => {

	const {
		ref,
		width,
		height,
		preserveAspectRatio
	} = attributes;

	const selectProject = () => {
		if (!window.wpgModal){
			return;
		}
		window.wpgModal().open().once('select', project => setAttributes({
			ref:project.id
		}));
	};

	if (!ref){
		return (
			<Placeholder
				label={__('Select a Project', 'wpgraphicator')}
				icon='format-image'
				instructions={__('Click the button to open the modal.', 'wpgraphicator')} >
				<Button
					isPrimary
					onClick={selectProject} >
					{__('Select a Project', 'wpgraphicator')}
				</Button>
			</Placeholder>
		);
	}

	return [
		<Inspector
			key='inspector'
			attributes={attributes}
			setAttributes={setAttributes} />,
		<BlockControls key='controls'>
			<ToolbarGroup>
				<ToolbarButton
					label={__('Select a Project', 'gutenpb')}
					icon='format-image'
					onClick={selectProject} />
			</ToolbarGroup>
		</BlockControls>,
		RawHTML({
			key:'content',
			className,
			children:createAdditionalAttrs(svgContent, {
				width,
				height,
				preserveAspectRatio
			})
		})
	];

};

export default withSelect((select, {attributes}) => {
	const id = attributes.ref;
	const {
		getEntityRecord
	} = select('core');
	const project = getEntityRecord('postType', 'wpgraphicator', id);
	const svgContent = project && project.content && project.content.raw;
	return {
		svgContent
	};
})(BlockEdit);
