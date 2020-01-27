const express = require('express');
const app = express();
//const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const apiRouter = express.Router();
const config = require('../config');
const AppError = require('./errors/AppError');
const appError = new AppError();

// Database stuff
const Database = require('./services/Database');
const db = new Database();

async function init() {
	await db.createConnection();
}

init();
const AuthController = require('./controllers/AuthController');
const authController = new AuthController(db);
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
apiRouter.post('/auth', (req, resp) => {
	authController.login(req, resp);
});
apiRouter.delete('/auth', authController.logout);

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

apiRouter.get('/users', authController.getUsers);
apiRouter.post('/users', authController.createUser);
apiRouter.delete('/users/:userId', authController.deleteUser);

apiRouter.get('/zones', (req, resp) => {
	zoneController.getZones(req, resp);
});
apiRouter.post('/zones', (req, resp) => {
	zoneController.createZone(req, resp);
});
apiRouter.patch('/zones/:zoneId', (req, resp) => {
	zoneController.modifyZone(req, resp);
});
apiRouter.delete('/zones/:zoneId', (req, resp) => {
	zoneController.deleteZone(req, resp);
});

apiRouter.get('/zones/:zoneId/bays', (req, resp) => {
	bayController.getBays(req, resp);
});
apiRouter.post('/zones/:zoneId/bays', (req, resp) => {
	bayController.createBay(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId', (req, resp) => {
	bayController.modifyBay(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId', (req, resp) => {
	bayController.deleteBay(req, resp);
});

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves', (req, resp) => {
	shelfController.getShelves(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves', (req, resp) => {
	shelfController.createShelf(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	shelfController.modifyShelf(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	shelfController.deleteShelf(req, resp);
});

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', (req, resp) => {
	rowController.getRows(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', (req, resp) => {
	rowController.createRow(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	rowController.modifyRow(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	rowController.deleteRow(req, resp);
});

app.use('/api/v1', apiRouter);

module.exports = {app};