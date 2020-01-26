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
const Database = require('./services/Database');
const db = new Database();
db.createConnection();
const ZoneController = require('./controllers/ZoneController');
const zoneController = new ZoneController(db);
const BayController = require('./controllers/BayController');
const bayController = new BayController(db);
const ShelfController = require('./controllers/ShelfController');
const shelfController = new ShelfController(db);
const RowController = require('./controllers/RowController');
const rowController = new RowController(db);
const ColumnController = require('./controllers/ColumnController');
const columnController = new ColumnController(db);
const TrayController = require('./controllers/TrayController');
const trayController = new TrayController(db);

app.use(express.json());

apiRouter.use(require('cookie-parser')());

apiRouter.post('/auth', authController.login);
apiRouter.delete('/auth', authController.logout);

apiRouter.get('/users', authController.getUsers);
apiRouter.post('/users', authController.createUser);
apiRouter.delete('/users/:userId', authController.deleteUser);

apiRouter.get('/zones', zoneController.getZones);
apiRouter.post('/zones', zoneController.createZone);
apiRouter.patch('/zones/:zoneId', zoneController.modifyZone);
apiRouter.delete('/zones/:zoneId', zoneController.deleteZone);

apiRouter.get('/zones/:zoneId/bays', bayController.getBays);
apiRouter.post('/zones/:zoneId/bays', bayController.createBay);
apiRouter.patch('/zones/:zoneId/bays/:bayId', bayController.modifyBay);
apiRouter.delete('/zones/:zoneId/bays/:bayId', bayController.deleteBay);

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves', shelfController.getShelves);
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves', shelfController.createShelf);
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId', shelfController.modifyShelf);
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId', shelfController.deleteShelf);

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', rowController.getRows);
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', rowController.createRow);
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId', rowController.modifyRow);
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId', rowController.deleteRow);

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