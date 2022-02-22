import $ from 'jquery';

import './canvas/extend-fabric.js';
import './canvas/extend-shadow.js';
import './canvas/extend-gradient.js';
import './canvas/extend-object.js';
import './canvas/extend-line.js';
import './canvas/extend-rect.js';
import './canvas/extend-ellipse.js';
import './canvas/extend-circle.js';
import './canvas/extend-path.js';
import './canvas/extend-polyline.js';
import './canvas/extend-text.js';
import './canvas/extend-itext.js';
import './canvas/extend-image.js';
import './canvas/extend-group.js';
import './canvas/extend-active-selection.js';
import './utils/jquery-plugins.js';
import './utils/animation-exporter.js';
import wpgEditor from 'wpgeditor';
import Editor from './view/editor.js';
import {
	registerShape
} from './utils/shape-library.js';
import {
    registerFont
} from './utils/utils.js';

/**
 * Export registerShape() function to let people
 * register additional shapes to the shape library.
 * @since 1.0.0
 */

wpgEditor.registerShape = registerShape;

/**
 * Export registerFont() function to let people
 * add fonts to font family list.
 * @since 1.5.0
 */

wpgEditor.registerFont = registerFont;

/**
 * Load and export wpgEditor api on document ready.
 * @since 1.0.0
 */

$(() => {
	wpgEditor.instance = new Editor();
});
