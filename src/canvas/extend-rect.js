import {
	Rect,
	util
} from 'fabric';

util.object.extend(Rect.prototype, {
	/**
	 * Extend fabric.Rect.prototype._toSVG()
	 * @since 1.4.0
	 */
	_toSVG(){
		const {
			x,
			y
		} = this._calcSVGTransformByOrigin();
		return [
			'<rect ', 'COMMON_PARTS',
			'x="', x, '" y="', y,
			'" rx="', this.rx, '" ry="', this.ry,
			'" width="', this.width, '" height="', this.height,
			'" />\n'
		];
	}
});
