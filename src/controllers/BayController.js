const AppError = require('../errors/AppError');
const appError = new AppError();
const BayModel = require('../models/BayModel');

class BayController {

    constructor(db){
        this.db = db;
        this.basicTrayData = {
            'category': '',
            'weight': 0.0,
            'expiryYear': { 'start': null, 'end': null },
            'expiryMonth': { 'start': null, 'end': null },
            'lastUpdated': null,
            'userNote': ''
        };
        this.basicShelfData = {
            '0': {
                '0': this.basicTrayData,
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData
            },
            '1': {
                '0': this.basicTrayData,
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData
            },
            '2': {
                '0': this.basicTrayData,
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData
            },
        };
        this.basicBayData = {
            '1': this.basicShelfData,
            '2': this.basicShelfData,
            '3': this.basicShelfData,
            '4': this.basicShelfData,
            '5': this.basicShelfData
        };
    }

	async getBays(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const bays = await this.getBaysFromDb(req.params.zoneId);
		resp.status(200);
		resp.send(bays);
	}

	async createBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const bay = new BayModel();
		if(!bay.map(req.body)) return;
		await this.insertBay(req.params.zoneId, bay.name);
		resp.status(201);
		resp.send(bay.fields);
    }
    
    async createManyBays(req, resp) {
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const bay = new BayModel();
		await this.insertBays(req.params.zoneId, req.params.numberOfBays);
		resp.status(201);
		resp.send(bay.fields);
    }

    async deleteManyBays(req, resp) {
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
        const bay = new BayModel();
		await this.deleteBays(req.params.zoneId, req.params.numberOfBays);
		resp.status(201);
		resp.send(bay.fields);
    }
	
	async modifyBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const bay = new BayModel();
		if(!bay.map(req.body)) return;
		await this.changeBayName(req.params.zoneId, req.params.bayId, bay.name);
		resp.status(200);
		resp.send(bay.fields);
	}
	
	async deleteBay(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.deleteBayFromDb(req.params.zoneId, req.params.bayId);
		resp.sendStatus(204);
	}

    async getBaysFromDb(zone){
        let bays = [];

        try {
            let cursor = await this.db.queryDatabase('warehouse', {});
            await cursor.forEach(function(result){
                for(let key in result[zone]){
					if(key.startsWith('_')) {
						continue;
					}
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
        let updateQuery = { $set: { [insertStringLeft]: this.basicBayData } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteBayFromDb(zoneName, bayName){
        let deleteStringLeft = zoneName + '.' + bayName;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteBays(zoneName, newNumberOfBays){
        let originalBays = await this.getBaysFromDb(zoneName);
        let numOfOrigBays = originalBays.length;
        if(newNumberOfBays >= numOfOrigBays)
            return;
        for(let bayIndex = numOfOrigBays-1; bayIndex >= newNumberOfBays; bayIndex--){
            this.deleteBayFromDb(zoneName, originalBays[bayIndex]);
        }
    }

    async insertBays(zoneName, newNumberOfBays){
        let originalBays = await this.getBaysFromDb(zoneName);
        let numOfOrigBays = originalBays.length;
        if(newNumberOfBays <= numOfOrigBays)
            return;
        for(let offset = numOfOrigBays; offset < newNumberOfBays; offset++){
            let bayName = String.fromCharCode(65 + offset);
            this.insertBay(zoneName, bayName);
        }
    }
}

module.exports = BayController;