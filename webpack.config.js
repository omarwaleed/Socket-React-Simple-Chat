const path = require('path');

module.exports = {
    entry: './public/App.jsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve('public')
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: [{
                    loader: "babel-loader",
                }],
                exclude: /node_modules/
            }
        ]
    }
}
