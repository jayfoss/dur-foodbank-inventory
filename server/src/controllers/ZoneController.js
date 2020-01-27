const AppError = require('../errors/AppError');
const appError = new AppError();
const ZoneModel = require('../models/ZoneModel');

class ZoneController {

    constructor(db){
        this.db = db;
    }

	async getZones(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const zones = await this.getZonesFromDb();
		resp.status(200);
		resp.send(zones);		
	}
	
	async createZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const zone = new ZoneModel();
		if(!zone.map(req.body)) return;
		await this.insertZone(zone.name);
		resp.status(201);
		resp.send(zone.fields);
	}
	
	async modifyZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const zone = new ZoneModel();
		if(!zone.map(req.body)) return;
		await this.changeZoneName(req.params.zoneId, zone.name);
		resp.status(200);
		resp.send(zone.fields);
	}
	
	async deleteZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.deleteZoneFromDb(req.params.zoneId);
		resp.sendStatus(204);
	}
	
    async getZonesFromDb(){
        let zones = [];

        try {
            let cursor = await this.db.queryDatabase('warehouse', {});

            await cursor.forEach(function(result){
                for(let key in result){
					if(key === '_id') continue;
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