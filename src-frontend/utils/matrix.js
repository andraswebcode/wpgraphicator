const multiply = (a, b) => [
	a[0] * b[0] + a[2] * b[1],
	a[1] * b[0] + a[3] * b[1],
	a[0] * b[2] + a[2] * b[3],
	a[1] * b[2] + a[3] * b[3],
	a[0] * b[4] + a[2] * b[5] + a[4],
	a[1] * b[4] + a[3] * b[5] + a[5]
];

const getDimensionMatrix = ({scaleX, scaleY, skewX, skewY}) => {
	var x = scaleX === undefined ? 1 : scaleX;
	var y = scaleY === undefined ? 1 : scaleY;
	var matrix = [x, 0, 0, y, 0, 0];
	if (skewX){
		matrix = multiply(
			matrix,
			[1, 0, Math.tan(skewX * (Math.PI / 180)), 1, 0, 0]
		);
	}
	if (skewY){
		matrix = multiply(
			matrix,
			[1, Math.tan(skewY * (Math.PI / 180)), 0, 1, 0, 0]
		);
	}
	return matrix;
};

const getRotateMatrix = ({angle}) => {
	if (!angle){
		return [1, 0, 0, 1, 0, 0];
	}
	var theta = angle * (Math.PI / 180);
	var sin = Math.sin(theta);
	var cos = Math.cos(theta);
	return [cos, sin, -sin, cos, 0, 0];
};

export const decompose = m => {
	const angle = Math.atan2(m[1], m[0]) / (Math.PI / 180);
	const denom = Math.pow(m[0], 2) + Math.pow(m[1], 2);
	const scaleX = Math.sqrt(denom);
	const scaleY = (m[0] * m[3] - m[2] * m[1]) / scaleX;
	const skewX = Math.atan2(m[0] * m[2] + m[1] * m [3], denom) / (Math.PI / 180);
	return {
		angle:angle,
		scaleX:scaleX,
		scaleY:scaleY,
		skewX:skewX,
		skewY:0,
		left:m[4],
		top:m[5]
	};
};

export const getTransformMatrix = (options = {}) => {
	const {
		top = 0,
		left = 0,
		scaleX = 1,
		scaleY = 1,
		skewX,
		skewY,
		angle
	} = options;
	let matrix = [1, 0, 0, 1, left, top];
	if (angle){
		matrix = multiply(matrix, getRotateMatrix(options));
	}
	if (scaleX !== 1 || scaleY !== 1 || skewX || skewY){
		matrix = multiply(matrix, getDimensionMatrix(options));
	}
	return matrix;
};
