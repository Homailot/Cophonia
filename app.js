var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs= require("hbs");
var mysql = require("mysql");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
//var mainRouter = require("./routes/siteRoute/main");
//var aboutRouter = require("./routes/siteRoute/about");
//var loginRouter = require("./routes/siteRoute/login");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/sitehbs/partials"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
//app.use("/site", mainRouter);
//app.use("/site/about", aboutRouter);
////app.use("/site", loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
