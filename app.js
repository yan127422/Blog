var express = require('express');
var app = express();
var MongoStore = require("connect-mongo")(express),
    path = require('path'),
     routes = require('./routes'),
    flash = require('connect-flash'),
    PORT = 8080;
app.configure(function(){
    app.enable('trust proxy');
    app.set('port',PORT);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(flash());
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('expressdemo'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.errorHandler());
     app.use(express.static(path.join(__dirname, 'static')));
});
 routes.index(app);

 
app.listen(PORT);
