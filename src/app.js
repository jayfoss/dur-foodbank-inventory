const express = require('express');
const app = express();
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
const UserController = require('./controllers/UserController');
const userController = new UserController(db);

app.use(express.json());
app.use('/', express.static('./client', {maxAge: 3600000}));

apiRouter.use(require('cookie-parser')());
apiRouter.post('/auth', (req, resp) => {
	authController.login(req, resp);
});
apiRouter.delete('/auth', authController.logout);

apiRouter.use(function(req, resp, next) {
	const _id = req.cookies._id;
	const _p = req.cookies._p;
	if (_id && _p) {
		const tok = _id.split('.');
		jwt.verify(tok[0] + '.' + _p + '.' + tok[1], config.auth.jwtSecret, function(err, decoded) {
			if (err) {
				return appError.unauthorized(resp, 'Invalid or expired authorization token.');
			} else {
				req.jwtDecoded = decoded;
				next();
			}
		});
	} else {
		return appError.unauthorized(resp, 'Missing or incomplete authorization token.');
	}
});

apiRouter.get('/users', (req, resp) => {
	authController.getUsers(req, resp);
});
apiRouter.post('/users', (req, resp) => {
	authController.createUser(req, resp);
});
apiRouter.delete('/users/:userId', (req, resp) => {
	authController.deleteUser(req, resp);
});

apiRouter.get('/report', (req, resp) => {
	trayController.getReportData(req, resp);
});

apiRouter.get('/zones', (req, resp) => {
	zoneController.getZones(req, resp);
});
apiRouter.get('/zones/:zoneId', (req, resp) => {
	zoneController.getZoneInfo(req, resp);
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

apiRouter.post('/zones/:zoneId/bays/insertmany/:numberOfBays', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	bayController.createManyBays(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/deletemany/:numberOfBays', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	bayController.deleteManyBays(req, resp);
});
apiRouter.get('/zones/:zoneId/bays', (req, resp) => {
	bayController.getBays(req, resp);
});
apiRouter.post('/zones/:zoneId/bays', (req, resp) => {
	bayController.createBay(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId', (req, resp) => {
	bayController.deleteBay(req, resp);
});

apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/insertmany/:numberOfShelves', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	shelfController.createManyShelves(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/deletemany/:numberOfShelves', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	shelfController.deleteManyShelves(req, resp);
});
apiRouter.get('/zones/:zoneId/bays/:bayId/shelves', (req, resp) => {
	shelfController.getShelves(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves', (req, resp) => {
	shelfController.createShelf(req, resp);
});
apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	shelfController.getShelfInfo(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	shelfController.modifyShelf(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId', (req, resp) => {
	shelfController.deleteShelf(req, resp);
});

apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/insertmany/:numberOfRows', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	rowController.createManyRows(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/deletemany/:numberOfRows', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	rowController.deleteManyRows(req, resp);
});
apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', (req, resp) => {
	rowController.getRows(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows', (req, resp) => {
	rowController.createRow(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId', (req, resp) => {
	rowController.modifyRow(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId', (req, resp) => {
	rowController.deleteRow(req, resp);
});

apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/insertmany/:numberOfColumns', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	columnController.createManyColumns(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/deletemany/:numberOfColumns', (req, resp) => { // TEMPORARY ROUTE (TESTING)
	columnController.deleteManyColumns(req, resp);
});
apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns', (req, resp) => {
	columnController.getColumns(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns', (req, resp) => {
	columnController.createColumn(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId', (req, resp) => {
	columnController.modifyColumn(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId', (req, resp) => {
	columnController.deleteColumn(req, resp);
});

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId/tray', (req, resp) => {
	trayController.getTray(req, resp);
});
apiRouter.post('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId/tray', (req, resp) => {
	trayController.createTray(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId/tray', (req, resp) => {
	trayController.modifyTray(req, resp);
});
apiRouter.delete('/zones/:zoneId/bays/:bayId/shelves/:shelfId/rows/:rowId/columns/:columnId/tray', (req, resp) => {
	trayController.deleteTray(req, resp);
});

apiRouter.get('/zones/:zoneId/bays/:bayId/shelves/:shelfId/trays', (req, resp) => {
	trayController.getTraysOnShelf(req, resp);
});
apiRouter.patch('/zones/:zoneId/bays/:bayId/shelves/:shelfId/trays', (req, resp) => {
	trayController.updateTraysOnShelf(req, resp);
});
apiRouter.get('/trays', (req, resp) => {
	trayController.getAllTrays(req, resp);
});

apiRouter.get('/users1', (req, resp) => {
	userController.getAllUsers(req, resp);
});

apiRouter.post('/users1', (req, resp) => {		//adding new user
	userController.addUser(req, resp);
});

apiRouter.patch('/users1', (req, resp) => {		//updating current user
	userController.updateUser(req, resp);
});

app.use('/api/v1', apiRouter);

module.exports = {app};