import {
	Collection
} from 'backbone';
import {
	debounce,
	clone,
	each
} from 'underscore';
import fabric from 'fabric';

const {
	Gradient,
	util
} = fabric;
const {
	capitalize
} = util.string;

/**
 * Undo-redo manager.
 * @since 1.0.0
 * @class
 */

export default class {

	/**
	 * Constructor.
	 * @since 1.0.0
	 */

	constructor(){
		this.index = -1;
		this.stack = new Collection();
	}

	/**
	 *
	 * @since 1.0.0
	 */

	registerAndStart({scene, shapes}){
		this.scene = scene;
		this.shapes = shapes;
		this.shapes.on('wpg:pushtohistorystack', debounce(this._addToStack.bind(this), 20));
	}

	/**
	 *
	 * @since 1.0.0
	 * @return {boolean} Whether there is something to undo or not.
	 */

	undo(){
		this.__disableAddToStack = true;
		if (this.index >= 0){
			this._executeUndoRedo(false);
		}
		setTimeout(() => {
			this.__disableAddToStack = false;
		}, 250);
		return (this.index >= 0);
	}

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @return {boolean} Whether there is something to redo or not.
	 */

	redo(){
		this.__disableAddToStack = true;
		if (this.index < this.stack.length - 1){
			this._executeUndoRedo(true);
		}
		setTimeout(() => {
			this.__disableAddToStack = false;
		}, 250);
		return (this.index < this.stack.length - 1);
	}

	/**
	 *
	 * @since 1.0.0
	 * @access private
	 * @param {boolean} redo Whether to redo or not (undo).
	 */

	_executeUndoRedo(redo){
		const index = redo ? ++this.index : this.index--;
		const current = this.stack.at(index);
		if (!current){
			return;
		}
		const modelState = current.get('model');
		const shapeState = current.get('shape');
		const action = current.get('action');
		const shapeModel = this.shapes.get(modelState?.id);
		const shapeObject = this.scene.getObjectById(modelState?.id);
		switch (action){
			case 'add':
			if (redo){
				this.__remakeRemovedShape(modelState, shapeState);
			} else {
				this.shapes.remove(shapeModel);
				this.scene.remove(shapeObject);
			}
			break;
			case 'bulk:add':
			if (redo){
				// Do something...
			} else {
				each(modelState, ({id}) => {
					this.shapes.remove(this.shapes.get(id));
					this.scene.remove(this.scene.getObjectById(id));
				});
			}
			break;
			case 'change':
			if (shapeModel){
				// Needs remove properties to rerender views.
				shapeModel.set('properties', []);
				shapeModel._properties.set([]);
				shapeModel.set(modelState);
			}
			if (shapeObject){
				// Replace value with fabric.Gradient() if it is a gradient.
				if (shapeState?.fill?.colorStops){
					shapeState.fill = new Gradient(shapeState.fill);
				}
				if (shapeState?.stroke?.colorStops){
					shapeState.stroke = new Gradient(shapeState.stroke);
				}
				shapeObject.set(shapeState);
				if (shapeObject.controls.p0){ // Check if is path, or polyline drawing mode.
					shapeObject._createPathControls?.(false, true);
					shapeObject._createPolylineControls?.(false, true);
				}
				this.scene.requestRenderAll();
			}
			break;
			case 'bulk:change':
			break;
			case 'remove':
			if (redo){
				this.shapes.remove(shapeModel);
				this.scene.remove(shapeObject);
			} else {
				this.__remakeRemovedShape(modelState, shapeState);
			}
			break;
			case 'bulk:remove':
			if (redo){
				// Do something...
			} else {
				each(modelState, (ms, i) => this.__remakeRemovedShape(ms, shapeState[i]));
			}
			break;
			default:
			break;
		}
		this.stack.trigger('wpg:undoredo');
	}

	/**
	 * Note: shapeModel, and shape have to be the original instance of it,
	 * (or array of instances of these) not the cloned one.
	 * @since 1.0.0
	 * @access private
	 * @param {object|array} shapeModel
	 * @param {string} action Add, change, or remove.
	 * @param {object|array} shape
	 */

	_addToStack(shapeModel, action, shape){
		const bulkAction = (action?.indexOf('bulk:') === 0);
		if (!this.__disableAddToStack){
			if (this.index < this.stack.length - 1){
				this.stack.reset(this.stack.slice(0, this.index + 1));
			}
			if (bulkAction){ // In case of bulk action.
				const models = shapeModel.map(model => clone(model._prevState));
				const shapes = shape.map(obj => clone(obj._stateProperties));
				this.stack.add({
					model:models,
					shape:shapes,
					action
				});
			} else { // In case of a single action.
				shape = shape || this.scene.getObjectById(shapeModel.get('id'));
				this.stack.add({
					model:clone(shapeModel._prevState),
					shape:clone(shape._stateProperties),
					action
				});
			}
			this.index++;
		}
		if (!bulkAction){
			shapeModel._prevState = shapeModel.toJSON();
		}
	}

	/**
	 * Helper method for remaking removed object on undo, or redo.
	 * @since 1.0.0
	 * @access private
	 * @param {object} modelState
	 * @param {object} shapeState
	 */

	__remakeRemovedShape(modelState, shapeState){
		const type = modelState.type;
		const shapeClass = fabric[type === 'i-text' ? 'IText' : capitalize(type)];
		if (shapeClass && shapeClass.fromObject){
			shapeClass.fromObject(shapeState, newShape => {
				newShape.id = modelState.id;
				// There is no need to explicitly add shapeModel because it is added on scene's object added event.
				this.scene.add(newShape);
				this.shapes.get(newShape.id)?.set(modelState);
			});
		}
	}

}
