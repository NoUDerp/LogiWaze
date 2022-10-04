module.exports = 
{
	output: {
		filename: "FoxholeRouter.js"
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: "file-loader",
			},
		]
	},
//	target: "es5"
/*	"externals": {
		"leaflet": "L"
	}*/
}
