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
			'wpgraphicator':'./src-frontend/index.js'
		},
		output:{
			filename:`[name].build${minSfx}.js`,
			path:path.resolve(__dirname, 'assets/frontend/js'),
			library:'wpGraphicator',
			libraryTarget:'umd',
			globalObject:'window'
		},
		externals:{
			jquery:'jQuery'
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
			'wpgraphicator-styles':'./src-frontend/styles.scss'
		},
		output:{
			filename:`[name].build${minSfx}.js`,
			path:path.resolve(__dirname, 'assets/frontend/css')
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
