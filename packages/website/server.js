var express = require("express");
var favicon = require('serve-favicon');
var path = require("path");
var mu2Express = require("mu2Express");
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
app.use(favicon(path.join(__dirname, 'public','images','favicon','favicon.ico')));

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
  console.log('serving thumbnail route');
  var order = req.query.order;
  var obj;
  if (order) {
    obj = JSON.parse(decodeURIComponent(order));
    res.setHeader('Content-Type', 'image/png');
    // Generate thumbnail and pipe to response
    wkhtmltoimage.generate(orderThumbnailParser(obj), { width: '650', height: '650' })
    .pipe(res).on('end', function() {
      console.log('stream ended', arguments[0]);
    })
    return;
  }
  res.status(400).send({ error: 'missing order' });
});

// Route for the main site

app.get("/*", (req, res, next) => {
  var order = req.query.order;
  var obj;
  try {
    obj = (order) ? JSON.parse(decodeURIComponent(order)) : undefined;
  } catch(e) {
    console.log('Error parsing order')
  }
  // console.log('req.query.order', decodeURIComponent(order), typeof req.query.order);
  // console.log('obj', obj, typeof obj.thumbnailContent);
  var thumbnailContent = obj && obj.signedOrder && obj.signedOrder.orderThumbnailContent;
  var imageURL = (thumbnailContent) ? '/OGThumbnail/?order=' + encodeURIComponent(order) : '/images/og_image.png';
  res.render('home', {
      locals: {
        OGImageURL: imageURL
      }
  });
});
app.listen(app.get("port"));
