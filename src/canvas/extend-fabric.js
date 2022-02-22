import {
	util
} from 'fabric';

/**
 * 
 * @since 1.5.0
 * @param {string} style
 * @param {object} oStyle
 */

function parseStyleString(style, oStyle) {
	var attr, value, prop, val, val2;
	style.replace(/;\s*$/, '').split(';').forEach(chunk => {
		const pair = chunk.split(':');
		attr = pair[0].trim().toLowerCase();
		value =  pair[1].trim();
		if (attr === 'transform'){
			const transform = value.split(') ').map(_chunk => {
				_chunk = _chunk.match(/([a-zA-Z]+)\((\d*\.?\d+)\D*(\d*\.?\d*)/) || [];
				prop = _chunk[1] || '';
				val = parseFloat(_chunk[2]) || 0;
				val2 = _chunk[3] ? ' ' + (parseFloat(_chunk[3]) || 0) : '';
				if (prop === 'translateX'){
					return `translate(${val} 0)`;
				} else if (prop === 'translateY'){
					return `translate(0 ${val})`;
				} else if (prop === 'scaleX'){
					return `scale(${val} 1)`;
				} else if (prop === 'scaleY'){
					return `scale(1 ${val})`;
				}
				return `${prop}(${val}${val2})`;
			}).join(' ');
			oStyle.transform = transform;
		} else {
			oStyle[attr] = value;
		}
	});
}

/**
 * 
 * @since 1.5.0
 * @param {object} style
 * @param {object} oStyle
 */

function parseStyleObject(style, oStyle) {
	var attr, value;
	for (var prop in style){
		if (typeof style[prop] === 'undefined'){
			continue;
		}
		attr = prop.toLowerCase();
		value = style[prop];
		oStyle[attr] = value;
	}
}

util.object.extend(fabric, {
	/**
	 * Extend fabric.getCSSRules()
	 * @since 1.5.0
	 * @return {object}
	 */
	getCSSRules(doc){

		const styles = doc.getElementsByTagName('style');
		const allRules = {};
		var i, len, rules;

		for (i = 0, len = styles.length; i < len; i++){

			let styleContents = styles[i].textContent;

			// remove comments
			styleContents = styleContents.replace(/\/\*[\s\S]*?\*\//g, '');
			if (styleContents.trim() === ''){
				continue;
			}

			rules = styleContents.match(/[^{]*\{[\s\S]*?\}/g);
			if (!rules){
				continue;
			}
			rules = rules.map(rule => rule.trim());

			// eslint-disable-next-line no-loop-func
			rules.forEach(rule => {
				const match = rule.match(/([\s\S]*?)\s*\{([^}]*)\}/);
				const ruleObj = {};
				const declaration = match[2].trim();
				const propertyValuePairs = declaration.replace(/;$/, '').split(/\s*;\s*/);
				for (i = 0, len = propertyValuePairs.length; i < len; i++){
					const pair = propertyValuePairs[i].split(/\s*:\s*/);
					const property = pair[0];
					const value = pair[1];
					ruleObj[property] = value;
				}
				rule = match[1];
				rule.split(',').forEach(_rule => {
					_rule = _rule.replace(/^svg/i, '').trim();
					if (_rule === '') {
						return;
					}
					if (allRules[_rule]) {
						util.object.extend(allRules[_rule], ruleObj);
					} else {
						allRules[_rule] = util.object.clone(ruleObj);
					}
				});
			});

		}

		return allRules;

	},
	/**
	 * Extend fabric.parseStyleAttribute()
	 * This method is exactly same as the core fabric method,
	 * but we need redeclare for scope,
	 * because we make changes in private functions:
	 * parseStyleString()
	 * parseStyleObject()
	 * @since 1.5.0
	 * @param {SVGElement} element
	 * @return {object}
	 */
	parseStyleAttribute(element){

		const oStyle = {};
		const style = element.getAttribute('style');

		if (!style){
			return oStyle;
		}

		if (typeof style === 'string'){
			parseStyleString(style, oStyle);
		} else {
			parseStyleObject(style, oStyle);
		}

		return oStyle;

	}
});
