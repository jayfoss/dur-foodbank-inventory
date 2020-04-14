const AppError = require('../errors/AppError');
const appError = new AppError();
const ZoneModel = require('../models/ZoneModel');

class ZoneController {

    constructor(db){
		this.db = db;
		this.emptyTray = {'category':'', 'weight': 0.0, 'expiryYear':{'start':null, 'end':null}, 'expiryMonth':{'start':null, 'end':null}, 'lastUpdated':null, 'userNote':''};
    }

	async getZones(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const zones = await this.getZonesFromDb();
		resp.status(200);
		resp.send(zones);		
	}
	
	async getZoneInfo(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const zonw = await this.getZoneFromDb(req.params.zoneId);
		resp.status(200);
		resp.send(zone);
	}
	
	async createZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
        const zone = new ZoneModel();
		if(!zone.map(req.body)) return;
		let zoneObj = {};
		if(req.body._id && req.body.bays && req.body.shelves && req.body.rows && req.body.columns){
            zoneObj = {};
            for(let bay = 0; bay < req.body.bays; bay++){
                let bayStr = String.fromCharCode(65 + bay);
                zoneObj[bayStr] = {};
                for(let shelf = 1; shelf <= req.body.shelves; shelf++){
                    
                    zoneObj[bayStr][shelf] = {};
                    zoneObj[bayStr][shelf]['_shelfOk'] = false;
                    for(let row = 0; row < req.body.rows; row++){
                        zoneObj[bayStr][shelf][row] = {};
                        for(let column = 0; column < req.body.columns; column++){
                            zoneObj[bayStr][shelf][row][column] = this.emptyTray;
                        }
                    }
                    
                }
            }
        }
		await this.insertZone(zone._id, zone._color, zoneObj);
		resp.status(201);
		resp.send(zone.fields);
	}
	
	async modifyZone(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
        const zone = new ZoneModel();
        if(!zone.map(req.body)) return;
		await this.changeZoneName(req.params.zoneId, zone._id);
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
					const zoneData = {_id: key};
					for(let zoneInfoKey in result[key]) {
						if(zoneInfoKey.startsWith('_')) {
							zoneData[zoneInfoKey] = result[key][zoneInfoKey];
						}
					}
                    zones.push(zoneData);
                }
            });
        } catch (err){
            console.log(err);
		}
        return zones;
    }
	
	async getZoneFromDb(zoneId) {
		let zone = {};
		
		const query = '{\'' + zoneId + '\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                for(let key in result[zoneId]){
                    if(key.startsWith('_')) {
						zone[key] = result[zoneId][key];
					}
                }
            });
        } catch (err){
            console.log(err);
        }
        return shelf;
	}

    async insertZone(zoneName, zoneColor='FFFFFF', settableObject={}) {
        settableObject['_color'] = zoneColor;
        let filter = {[zoneName]: { $exists: false }};
        let updateQuery = { $set: { [zoneName]: settableObject } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

	async updateShelf(zoneId, zoneData){
		if(zoneData._id) {
			let filter = {};
			let renameStringLeft = zoneId;
			let renameStringRight = zoneData._id;
			let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
			await this.db.updateDatabase('warehouse', filter, updateQuery);
			zoneId = zoneData._id;
		}
        let insertStringLeft =  zoneName + '.' + bayName + '.' + zoneId;
        let filter = {[insertStringLeft]:{$exists: true}};
        let setObj = {}
        for(let key in shelfData){
			if(key === '_id') continue;
            setObj[insertStringLeft + '.' + key] = zoneData[key];
        }
		if(Object.keys(setObj).length > 0) {
			let updateQuery = {$set: setObj};
			await this.db.updateDatabase('warehouse', filter, updateQuery);
		}
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