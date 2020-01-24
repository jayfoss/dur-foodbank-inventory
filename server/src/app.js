const express = require('express');
const app = express();
//const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const apiRouter = express.Router();
const config = require('../config');
const AppError = require('./errors/AppError');
const appError = new AppError();
const AuthController = require('./controllers/AuthController');
const authController = new AuthController();
app.use(express.json());

apiRouter.use(require('cookie-parser')());

apiRouter.post('/login', authController.login);

apiRouter.use(function(req, resp, next) {
	let token = req.cookies._id;
	if (token) {
		jwt.verify(token, config.auth.jwtSecret, function(err, decoded) {
			if (err) {
				return appError.unauthorized(resp, 'Invalid or expired authorization token.');
			} else {
				req.jwtDecoded = decoded;
				next();
			}
		});
	} else {
		return appError.unauthorized(resp, 'No authorization token provided.');
	}
});

app.use('/api/v1', apiRouter);

module.exports = {app};