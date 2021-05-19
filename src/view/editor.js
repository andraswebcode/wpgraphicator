import $ from 'jquery';
import {
	api,
	i18n
} from 'wordpress';
import anime from 'animejs';
import {
	IText,
	loadSVGFromString
} from 'fabric';
import {
	extend,
	each,
	omit,
	isObject
} from 'underscore';
import {
	project_id,
	url
} from 'wpgeditor';

import Base from './base.js';
import Topbar from './frame-topbar.js';
import Toolbar from './frame-toolbar.js';
import Project from './frame-project.js';
import Settings from './frame-settings.js';
import Timeline from './frame-timeline.js';
import State from './../model/state.js';
import Shapes from './../model/shapes.js';
import Notifications from './../model/notifications.js';
import History from './../utils/history.js';
import Scene from './../canvas/class-scene.js';
import Clipboard from './../utils/clipboard.js';
import {
	toFixed,
	createSceneBackground
} from './../utils/utils.js';

const {
	Wpgraphicator
} = api.models;

const {
	__
} = i18n;

const {
	new_project
} = url;

/**
 * Editor view.
 * @since 1.0.0
 * @class
 * @augments Base
 * @augments Backbone.View
 */

export default Base.extend(/** @lends Editor.prototype */{

	/**
	 *
	 * @since 1.0.0
	 * @var {object}
	 */

	el:'#wpg-editor',

	/**
	 * Storage of registered frames.
	 * @since 1.0.0
	 * @var {object}
	 */

	views:{},

	/**
	 * Events.
	 * @since 1.0.0
	 * @var {object}
	 */

	events:{
		'keydown .wpg-input':'_resetClipboard'
	},

	/**
	 * Create model, collection instances.
	 * @since 1.0.0
	 * @var {object}
	 */

	state:new State(),
	shapes:new Shapes(),
	notifications:new Notifications(),

	/**
	 * Create history instance for undo/redo.
	 * @since 1.0.0
	 * @var {object}
	 */

	history:new History(),

	/**
	 * Create clipboard instance.
	 * @since 1.0.0
	 * @var {object}
	 */

	clipboard:new Clipboard(),

	/**
	 * Constructor.
	 * @since 1.0.0
	 * @constructs
	 */

	initialize(){
		this.project = new Wpgraphicator();
		this._createScene();
		this._createAnime();
		this.views.topbar = new Topbar(this.getViewOptions());
		this.views.toolbar = new Toolbar(this.getViewOptions());
		this.views.project = new Project(this.getViewOptions());
		this.views.settings = new Settings(this.getViewOptions());
		this.views.timeline = new Timeline(this.getViewOptions());
		this._fetchProject();
		this.listenTo(this.project, 'sync', this._setProjectID);
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_fetchProject(){
		const id = parseInt(project_id) || 0;
		if (id){
			this.project
			.set('id', id)
			.fetch({
				success:() => {
					this._loadProject();
					this._hidePreloader();
				},
				error:(model, response) => {
					console.error(response);
					if (response && response.responseJSON.code === 'rest_post_invalid_id'){
						window.location.replace(new_project);
					}
				}
			});
		} else {
			this._loadProject();
			this._hidePreloader();
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_loadProject(){
		const projectID = this.project.get('id');
		const title = this.project.get('title');
		const content = this.project.get('content');
		const meta = this.project.get('meta');
		if (!content){
			this._afterProjectLoaded();
			return;
		}
		if (projectID){
			this.setState('projectID', projectID);
		}
		if (title && title.raw){
			this.setState('projectName', title.raw);
		}
		if (content && content.raw){
			try {
				loadSVGFromString(content.raw, (shapes, scene, elements) => {
					each(shapes, (shape, i) => {
						const className = elements[i] && $(elements[i]).parent().attr('class');
						const transform = elements[i] && $(elements[i]).parent().data('transform');
						if (className){
							shape.id = className;
						}
						if (transform && isObject(transform)){
							extend(shape, transform);
						}
						if (shape.type === 'text'){
							// Fabric.js parses text svg element to Text object.
							// We replace it to IText to be editable.
							let text = shape.text;
							const textElem = $(elements[i]);
							if (className && className.indexOf('wpgraphicator') === 0 && textElem.find('tspan').length > 1){
								text = textElem.find('tspan').map((i, tspan) => $(tspan).text()).toArray().join('\n');
							}
							const matrix = (textElem.parent().attr('transform') || '')
								.replace('matrix(', '')
								.replace(')', '')
								.split(' ');
							const options = omit(shape.toObject(['id']), 'type', 'text', 'textLines');
							const textAnchor = textElem.attr('text-anchor');
							options.left = matrix[4] !== undefined ? parseFloat(matrix[4]) : options.left;
							options.top = matrix[5] !== undefined ? parseFloat(matrix[5]) : options.top;
							options.textAlign = (textAnchor === 'middle') ? 'center' : (textAnchor === 'end') ? 'right' : 'left';
							this.scene.add(new IText(text, options));
						} else {
							const wpId = $(elements[i]).parent().data('wpid');
							const wpSize = $(elements[i]).parent().data('wpsize');
							if (wpId){ // If shape is an image, we save attachment id to data-wpid attribute.
								shape.wpId = wpId;
							}
							if (wpSize){ // If shape is an image, we save image size to data-wpsize attribute.
								shape.wpSize = wpSize;
							}
							this.scene.add(shape);
						}
					});
				});
			} catch (error){
				console.error(error);
				this._hidePreloader();
				// Send notice after preloader has hidden.
				setTimeout(() => this.sendNotice(
					__('Something went wrong while parsing svg.', 'wpgraphicator'),
					'error'
				), 800);
			}
		}
		if (meta && meta.wpgraphicator_project){
			const wpgProject = meta.wpgraphicator_project;
			if (wpgProject.width){
				this.setState('projectWidth', wpgProject.width);
			}
			if (wpgProject.height){
				this.setState('projectHeight', wpgProject.height);
			}
			if (wpgProject.seconds){
				this.setState('seconds', wpgProject.seconds);
			}
			if (wpgProject.background){
				this.setState('projectBackground', wpgProject.background);
			}
		}
		if (meta && meta.wpgraphicator_transitions){
			this.shapes.set(meta.wpgraphicator_transitions);
		}
		this._afterProjectLoaded();
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_afterProjectLoaded(){
		this.history.registerAndStart({
			shapes:this.shapes,
			scene:this.scene
		});
		let hasChanged;
		this.$window.on('beforeunload', () => hasChanged);
		this.listenTo(this.shapes, 'wpg:pushtohistorystack', () => {
			hasChanged = ' ';
		});
		this.listenTo(this.project, 'sync', () => {
			hasChanged = undefined;
		});
	},

	/**
	 * Set up fabric scene.
	 * @since 1.0.0
	 * @access private
	 */

	_createScene(){
		const grid = this.getState('gridSize');
		const bgColor = this.getState('projectBackground');
		const pattern = createSceneBackground(1, grid, bgColor);
		this.scene = new Scene('wpg-canvas__scene', {
			containerClass:'wpg-scene',
			backgroundColor:pattern
		});
	},

	/**
	 * Set up anime timeline.
	 * @since 1.0.0
	 * @access private
	 */

	_createAnime(){
		this.anime = anime.timeline({
			autoplay:false,
			easing:'linear',
			update:({currentTime}) => {
				if (this.getState('isPlaying')){
					this.setState('currentTime', currentTime / 1000);
				}
				this.scene.requestRenderAll();
			},
			complete:() => this.setState('isPlaying', false)
		});
	},

	/**
	 * Set projectID state to render shortcode
	 * when we create a new project.
	 * As well as update url by adding id query string.
	 * @since 1.0.0
	 * @access private
	 * @param {object} project The project model fetched from database.
	 */

	_setProjectID(project){
		const id = project.get('id');
		const history = this.$window[0].history;
		this.setState('projectID', id);
		if (project.changed.id && history && history.pushState){
			history.pushState({}, '', `${new_project}&id=${id}`);
		}
	},

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 */

	_hidePreloader(){
		this.$('.wpg-editor__preloader').fadeOut(800);
	},

	/**
	 * Remove _object and _type from our clipboard api
	 * when we copy texts from any input in the editor
	 * to prevent browser default copy, and our clipboard api collisions.
	 * @since 1.0.0
	 * @access private
	 * @param {object} e Event.
	 */

	_resetClipboard(e){
		if ((e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.keyCode === 88)){ // C or X key.
			this.clipboard._object = null;
			this.clipboard._type = null;
		}
	}

});
