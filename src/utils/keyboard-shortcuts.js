import {
	i18n
} from 'wordpress';

const {
	__
} = i18n;

/**
 * A list of keyboard shortcuts, and descriptions.
 * @since 1.0.0
 * @var {array}
 */

export const keyboardShortcuts = [{
	title:__('Global', 'wpgraphicator'),
	shortcuts:[{
		combination:'Ctrl + S',
		description:__('Save Project as Published.', 'wpgraphicator')
	},{
		combination:'Ctrl + D',
		description:__('Save Project as Draft.', 'wpgraphicator')
	},{
		combination:'Ctrl + Z',
		description:__('Undo', 'wpgraphicator')
	},{
		combination:'Ctrl + V',
		description:__('Paste Shape, or Keyframe.', 'wpgraphicator')
	},{
		combination:'Ctrl + F',
		description:__('Fit Canvas to Screen.', 'wpgraphicator')
	},{
		combination:'Ctrl + G',
		description:__('Turn on/Off Snap to Grid.', 'wpgraphicator')
	},{
		combination:'Space',
		description:__('Play/Pause Animation.', 'wpgraphicator')
	},{
		combination:'Esc',
		description:__('Clear Selection.', 'wpgraphicator')
	},{
		combination:'Shift + Alt + C',
		description:__('Clear Canvas.', 'wpgraphicator')
	},{
		combination:'Shift + Alt + G',
		description:__('Group/Ungroup Selected Shapes.', 'wpgraphicator')
	},{
		combination:'Ctrl',
		description:__('Multiselection', 'wpgraphicator')
	}]
},{
	title:__('Toolbar', 'wpgraphicator'),
	shortcuts:[{
		combination:'Enter',
		description:__('Select Mode', 'wpgraphicator')
	},{
		combination:'D',
		description:__('Free Draw', 'wpgraphicator')
	},{
		combination:'R',
		description:__('Draw Square', 'wpgraphicator')
	},{
		combination:'C',
		description:__('Draw Ellipse', 'wpgraphicator')
	},{
		combination:'T',
		description:__('Add Text', 'wpgraphicator')
	},{
		combination:'P',
		description:__('Draw Path', 'wpgraphicator')
	},{
		combination:'Q',
		description:__('Draw Polyline', 'wpgraphicator')
	},{
		combination:'E',
		description:__('Edit Path', 'wpgraphicator')
	},{
		combination:'I',
		description:__('Add Image', 'wpgraphicator')
	},{
		combination:'+',
		description:__('Zoom In', 'wpgraphicator')
	},{
		combination:'-',
		description:__('Zoom Out', 'wpgraphicator')
	}]
},{
	title:__('Focus on Canvas', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Selected Shape Up.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Selected Shape Down.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Selected Shape Left.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Selected Shape Right.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Shape.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Selected Shape.', 'wpgraphicator')
	}]
},{
	title:__('Focus on a Keyframe', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Selected Keyframe Forward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Selected Keyframe Backward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Selected Keyframe Backward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Selected Keyframe Forward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'J',
		description:__('Jump Selected Keyframe to The Playhead.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Keyframe.', 'wpgraphicator')
	},{
		combination:'Space',
		description:__('Open Keyframe Settings Popup.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Selected Keyframe.', 'wpgraphicator')
	}]
},{
	title:__('Focus on Playhead', 'wpgraphicator'),
	shortcuts:[{
		combination:'Arrow Up',
		description:__('Move Playhead Forward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Down',
		description:__('Move Playhead Backward Per Second.', 'wpgraphicator')
	},{
		combination:'Arrow Left',
		description:__('Move Playhead Backward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Arrow Right',
		description:__('Move Playhead Forward Per 10 Millieconds.', 'wpgraphicator')
	},{
		combination:'Home',
		description:__('Move Playhead to 0 Second.', 'wpgraphicator')
	},{
		combination:'End',
		description:__('Move Playhead to The End.', 'wpgraphicator')
	}]
},{
	title:__('Drawing Shape', 'wpgraphicator'),
	shortcuts:[{
		combination:'Ctrl',
		description:__('Keep Aspect Ratio.', 'wpgraphicator')
	}]
},{
	title:__('Editing Text', 'wpgraphicator'),
	shortcuts:[{
		combination:'Up/Down/Left/Right',
		description:__('Move Cursor.', 'wpgraphicator')
	},{
		combination:'Shift + Left/Right',
		description:__('Select Character.', 'wpgraphicator')
	},{
		combination:'Shift + Up/Down',
		description:__('Select Text Vertically.', 'wpgraphicator')
	},{
		combination:'Alt + Left/Right',
		description:__('Move Cursor by Word.', 'wpgraphicator')
	},{
		combination:'Shift + Alt + Left/Right',
		description:__('Select Words.', 'wpgraphicator')
	},{
		combination:'Home',
		description:__('Move Cursor to Line Start.', 'wpgraphicator')
	},{
		combination:'End',
		description:__('Move Cursor to Line End.', 'wpgraphicator')
	},{
		combination:'Backspace',
		description:__('Delete Character Backward.', 'wpgraphicator')
	},{
		combination:'Delete',
		description:__('Delete Character Forward.', 'wpgraphicator')
	},{
		combination:'Ctrl + X',
		description:__('Cut Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + C',
		description:__('Copy Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + V',
		description:__('Paste Selected Text.', 'wpgraphicator')
	},{
		combination:'Ctrl + A',
		description:__('Select All.', 'wpgraphicator')
	},{
		combination:'Tab/Esc',
		description:__('Quit Editing.', 'wpgraphicator')
	}]
}];
