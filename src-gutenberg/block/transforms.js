import {
	createBlock
} from '@wordpress/blocks';

export default {
	to:[{
		type:'block',
		blocks:['wpgraphicator/cover'],
		transform:attributes => createBlock('wpgraphicator/cover', {
			...attributes
		})
	}]
};
