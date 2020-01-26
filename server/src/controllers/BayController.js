const AppError = require('../errors/AppError');
const appError = new AppError();
const BayModel = require('../models/BayModel');

class BayController {

    constructor(db){
        this.db = db;
    }

	getBays(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const bays = getBaysFromDb(req.params.zoneId);
		resp.status(200);
		resp.send(bays);
	}
	
	createBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const bay = new BayModel();
		if(!bay.map(req.body)) return;
		this.insertBay(req.params.zoneId, bay.name);
		resp.status(201);
		resp.send(bay.fields);
	}
	
	modifyBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const bay = new BayModel();
		if(!bay.map(req.body)) return;
		this.changeBayName(req.params.zoneId, req.params.bayId, bay.name);
		resp.status(200);
		resp.send(bay.fields);
	}
	
	deleteBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		this.deleteBayFromDb(req.params.zoneId, req.params.bayId);
		resp.sendStatus(204);
	}

    async getBaysFromDb(zone){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let bays = [];

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', {});
            await cursor.forEach(function(result){
                for(let key in result[zone]){
                    bays.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return bays;
    }

    async changeBayName(zoneName, oldBayName, newBayName) {
        let filter = {};
        let renameStringLeft = zoneName + '.' + oldBayName;
        let renameStringRight = zoneName + '.' + newBayName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertBay(zoneName, newBayName){
        let insertStringLeft = zoneName + '.' + newBayName;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteBayFromDb(zoneName, bayName){
        let deleteStringLeft = zoneName + '.' + bayName;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
}

module.exports = BayController;