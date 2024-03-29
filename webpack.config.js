const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {

	const {
		production
	} = env;
	const minSfx = production ? '.min' : '';

	return [{
		mode:production ? 'production' : 'development',
		watch:!production,
		entry:{
			'editor':'./src/index.js'
		},
		output:{
			filename:`[name].build${minSfx}.js`,
			path:path.resolve(__dirname, 'assets/admin/js')
		},
		externals:{
			fabric:'fabric',
			jquery:'jQuery',
			backbone:'Backbone',
			underscore:'_',
			wordpress:'wp',
			wpgeditor:'wpgEditor'
		},
		devtool:false,
		module:{
			rules:[{
				test:/\.js$/,
				exclude:/node_modules/,
				use:{
					loader:'babel-loader',
					options:{
						presets:['@babel/preset-env']
					}
				}
			}]
		}
	},{
		mode:production ? 'production' : 'development',
		watch:!production,
		entry:{
			'editor-styles':'./src/styles.scss',
			'projects-styles':'./src/projects.scss',
			'modal-styles':'./src/modal.scss',
			'about-styles':'./src/about.scss'
		},
		output:{
			filename:`[name].build${minSfx}.js`,
			path:path.resolve(__dirname, 'assets/admin/css')
		},
		devtool:false,
		module:{
			rules:[{
				test:/\.scss$/,
				exclude:/node_modules/,
				use:[
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			}]
		},
		plugins:[
			new MiniCssExtractPlugin({
				filename:`[name].build${minSfx}.css`
			})
		]
	}];

};
