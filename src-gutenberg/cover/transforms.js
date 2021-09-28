import {
	createBlock
} from '@wordpress/blocks';

export default {
	from:[{
		type:'block',
		blocks:['core/cover'],
		transform:(attributes, innerBlocks) => createBlock('wpgraphicator/cover', {
			...attributes
		}, innerBlocks)
	}],
	to:[{
		type:'block',
		blocks:['core/cover'],
		transform:(attributes, innerBlocks) => createBlock('core/cover', {
			...attributes
		}, innerBlocks)
	},{
		type:'block',
		blocks:['wpgraphicator/block'],
		transform:attributes => createBlock('wpgraphicator/block', {
			...attributes
		})
	}]
};
