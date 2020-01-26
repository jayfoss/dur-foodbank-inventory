const AppError = require('../errors/AppError');
const appError = new AppError();
const ZoneModel = require('../models/ZoneModel');

class ZoneController {

    constructor(db){
        this.db = db;
    }

	getZones(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const zones = getZonesFromDb();
		resp.status(200);
		resp.send(zones);		
	}
	
	createZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const zone = new ZoneModel();
		if(!zone.map(req.body)) return;
		this.insertZone(zone.name);
		resp.status(201);
		resp.send(zone.fields);
	}
	
	modifyZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const zone = new ZoneModel();
		if(!zone.map(req.body)) return;
		this.changeZoneName(req.params.zoneId, zone.name);
		resp.status(200);
		resp.send(zone.fields);
	}
	
	deleteZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		this.deleteZoneFromDb(req.params.zoneId);
		resp.sendStatus(204);
	}
	
    async getZonesFromDb(){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let zones = [];

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', {});

            await cursor.forEach(function(result){
                for(let key in result){
                    zones.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return zones;
    }

    async insertZone(zoneName) {
        let filter = {[zoneName]: { $exists: false }};
        let updateQuery = { $set: { [zoneName]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async changeZoneName(oldZoneName, newZoneName) {
        let filter = {};
        let updateQuery = { $rename: { [oldZoneName]:newZoneName } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteZoneFromDb(zoneName) {
        let filter = {};
        let updateQuery =  { $unset : { [zoneName]:''} };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
}

module.exports = ZoneController;