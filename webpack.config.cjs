module.exports = {
    devtools: 'sourc-map',
    module: {
      rules: [
        {
          test: /jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      ]
    }
  };