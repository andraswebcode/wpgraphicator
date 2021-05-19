import $ from 'jquery';
import anime from 'animejs';

import {
	getKeyframes,
	update
} from './animation.js';

export const timelines = {};

export const targets = {};

export const config = (shapes = [], options = {}) => {

	const {
		id,
		repeat = 1,
		direction = 'normal',
		play = 'onscreen',
		offset = 50
	} = options;
	const svgElement = $(`#wpgraphicator_${id}`);
	const loop = repeat === 'infinity' ? true : parseInt(repeat);
	timelines[`tl_${id}`] = anime.timeline({
		autoplay:false,
		easing:'linear',
		duration:0,
		delay:0,
		loop,
		direction
	});

	targets[`tr_${id}`] = {};
	$.each(shapes, (i, shape) => {
		const shapeId = shape.id;
		const keyframes = getKeyframes(shape);
		targets[`tr_${id}`][shapeId] = (shape.properties || []).reduce((result, prop) => {
			result[prop.id] = 0;
			return result;
		}, {});
		keyframes.targets = targets[`tr_${id}`][shapeId];
		const updateFn = update(targets[`tr_${id}`][shapeId], svgElement, shapeId, shape.type);
		keyframes.update = updateFn;
		keyframes.complete = updateFn;
		timelines[`tl_${id}`].add(keyframes, 0);
	});

	switch (play){
		case 'onscreen':
		svgElement.waypoint(() => {
			timelines[`tl_${id}`].play();
		},{
			offset:`${offset}%`
		});
		break;
		case 'onscreenonce':
		svgElement.waypoint(function(){
			timelines[`tl_${id}`].play();
			this.destroy();
		},{
			offset:`${offset}%`
		});
		break;
		case 'hover':
		svgElement.on('mouseenter', () => {
			timelines[`tl_${id}`].play();
		});
		break;
		case 'hoveronce':
		svgElement.one('mouseenter', () => {
			timelines[`tl_${id}`].play();
		});
		break;
		case 'hoverinout':
		let entered = false;
		let completed = false;
		svgElement.on({
			mouseenter:() => {
				entered = true;
				completed = false;
				timelines[`tl_${id}`].direction = 'normal';
				timelines[`tl_${id}`].restart();
			},
			mouseleave:() => {
				entered = false;
				if (completed){
					timelines[`tl_${id}`].direction = 'reverse';
					timelines[`tl_${id}`].restart();
				}
			}
		});
		timelines[`tl_${id}`].complete = () => {
			if (!entered && timelines[`tl_${id}`].direction === 'normal'){
				timelines[`tl_${id}`].direction = 'reverse';
				timelines[`tl_${id}`].restart();
			}
			if (timelines[`tl_${id}`].direction === 'normal'){
				completed = true;
			}
		};
		break;
		case 'click':
		svgElement.on('click', () => {
			timelines[`tl_${id}`].play();
		});
		break;
		default:
		break;
	}

};
