import {
	registerBlockType
} from '@wordpress/blocks';

import {
	__
} from '@wordpress/i18n';

import BlockEdit from './block/edit.jsx';
import blockIcon from './block/icon.jsx';
import blockTransforms from './block/transforms.js';
import CoverEdit from './cover/edit.jsx';
import CoverSave from './cover/save.jsx';
import coverIcon from './cover/icon.jsx';
import coverTransforms from './cover/transforms.js';

const sharedAttributes = {
	className:{
		type:'string'
	},
	anchor:{
		type:'string'
	},
	ref:{
		type:'number'
	},
	repeat:{
		type:'string',
		default:'1'
	},
	direction:{
		type:'string',
		default:'normal'
	},
	play:{
		type:'string',
		default:'onscreen'
	},
	offset:{
		type:'number',
		default:50
	},
	preserveAspectRatio:{
		type:'string',
		default:'xMidYMid meet'
	}
};

/**
 * Register wpgraphicator/block.
 * @since 1.0.0
 */

registerBlockType('wpgraphicator/block', {
	title:__('WPGraphicator', 'wpgraphicator'),
	description:__('', 'wpgraphicator'),
	category:'media',
	attributes:{
		...sharedAttributes,
		width:{
			type:'number'
		},
		height:{
			type:'number'
		},
		href:{
			type:'string'
		}
	},
	supports:{
		align:true,
		anchor:true,
		html:false
	},
	transforms:blockTransforms,
	icon:blockIcon,
	edit:BlockEdit,
	save:() => null
});

/**
 * Register wpgraphicator/cover.
 * @since 1.0.0
 */

registerBlockType('wpgraphicator/cover', {
	title:__('WPGraphicator Cover', 'wpgraphicator'),
	description:__('', 'wpgraphicator'),
	category:'media',
	attributes:{
		...sharedAttributes,
		textAlign:{
			type:'string'
		},
		minHeight:{
			type:'string',
			default:'400px'
		},
		overlayColor:{
			type:'string'
		},
		overlayGradient:{
			type:'string'
		},
		overlayOpacity:{
			type:'number',
			default:0.5
		}
	},
	supports:{
		align:true,
		anchor:true,
		html:false
	},
	transforms:coverTransforms,
	icon:coverIcon,
	edit:CoverEdit,
	save:CoverSave
});
