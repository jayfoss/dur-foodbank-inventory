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

// Database stuff
const ZoneController = require('./controllers/ZoneController');
const zoneController = new ZoneController();
const BayController = require('./controllers/BayController');
const bayController = new BayController();
const ShelfController = require('./controllers/ShelfController');
const shelfController = new ShelfController();
const RowController = require('./controllers/RowController');
const rowController = new RowController();
const ColumnController = require('./controllers/ColumnController');
const columnController = new ColumnController();
const TrayController = require('./controllers/TrayController');
const trayController = new TrayController();

app.use(express.json());

apiRouter.use(require('cookie-parser')());

apiRouter.post('/auth', authController.login);
apiRouter.delete('/auth', authController.logout);

apiRouter.get('/users', authController.getUsers);
apiRouter.post('/users', authController.createUser);
apiRouter.delete('/users/:userId', authController.deleteUser);

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

/* DATABASE CONTROLLER QUERY EXAMPLES
zoneController.getZones();
bayController.getBays("yellow");
shelfController.getShelves("yellow", "A");
rowController.getRows("yellow", "A", 1);
columnController.getColumns("yellow", "A", 1, 1);
trayController.getTray("yellow", "A", 1, 1, 1);
*/

module.exports = {app};