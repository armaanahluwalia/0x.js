var path = require("path");
var mu2Express = require("mu2Express");
var express = require("express");
var webpack = require("webpack");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");
var config = require("./webpack.config.js");
var wkhtmltoimage = require("wkhtmltoimage");
var orderThumbnailParser = require('./OrderThumbnailParser');
const app           = express(),
      DIST_DIR      = path.join(__dirname, "public"),
      isDevelopment = process.env.NODE_ENV !== "production",
      DEFAULT_PORT  = 3572,
      compiler      = webpack(config);

app.engine('mustache', mu2Express.engine);
app.set("port", process.env.PORT || DEFAULT_PORT);
app.set("view engine", "mustache");

if (isDevelopment) {
	app.use(webpackDevMiddleware(compiler, {
		publicPath: config.output.publicPath
	}));

	app.use(webpackHotMiddleware(compiler));
	app.use(express.static(DIST_DIR));
}

else {
	app.use(express.static(DIST_DIR));
}

// Route for the thumbnail Image

app.get('/OGThumbnail', (req, res, next) => {
  var order = req.query.order;
  var obj;
  if (order) {
    obj = JSON.parse(decodeURIComponent(order));
    res.setHeader('Content-Type', 'image/png');
    // HTML
    wkhtmltoimage.generate(orderThumbnailParser(obj), { width: '650', height: '650' })
    .pipe(res);
    return;
  }
  var error = new Error('missing order');
  error.status = 400;
  res.send(error);
});

// Route for the main site

app.get("*", (req, res, next) => {
  var order = req.query.order;
  var obj = order && JSON.parse(decodeURIComponent(order));
  // console.log('req.query.order', decodeURIComponent(order), typeof req.query.order);
  // console.log('obj', obj, typeof obj.thumbnailContent);
  var imageURL = (obj && obj.thumbnailContent) ? '/OGThumbnail/?order=' + encodeURIComponent(order) : '/images/og_image.png';
  res.render('home', {
      locals: {
        OGImageURL: imageURL
      }
  });
});
app.listen(app.get("port"));
