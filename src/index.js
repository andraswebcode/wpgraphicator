import $ from 'jquery';

import './canvas/extend-shadow.js';
import './canvas/extend-gradient.js';
import './canvas/extend-object.js';
import './canvas/extend-line.js';
import './canvas/extend-ellipse.js';
import './canvas/extend-circle.js';
import './canvas/extend-path.js';
import './canvas/extend-polyline.js';
import './canvas/extend-itext.js';
import './canvas/extend-image.js';
import './canvas/extend-group.js';
import './utils/jquery-plugins.js';
import wpgEditor from 'wpgeditor';
import Editor from './view/editor.js';
import {
	registerShape
} from './utils/shape-library.js';

/**
 * Export registerShape() function so that make ability
 * to register additional shapes to the shape library.
 * @since 1.0.0
 */

wpgEditor.registerShape = registerShape;

/**
 * Load and export wpgEditor api on document ready.
 * @since 1.0.0
 */

$(() => {
	wpgEditor.instance = new Editor();
});
