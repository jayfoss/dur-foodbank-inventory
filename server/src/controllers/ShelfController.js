const AppError = require('../errors/AppError');
const appError = new AppError();
const ShelfModel = require('../models/ShelfModel');

class ShelfController {

    constructor(db){
        this.db = db;
    }

	async getShelves(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const shelves = await this.getShelvesFromDb(req.params.zoneId, req.params.bayId);
		resp.status(200);
		resp.send(shelves);
	}
	
	async getShelfInfo(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const shelf = await this.getShelfFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		resp.status(200);
		resp.send(shelf);
	}
	
	async createShelf(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const shelf = new ShelfModel();
		if(!shelf.map(req.body)) return;
		await this.insertShelf(req.params.zoneId, req.params.bayId, shelf.number);
		resp.status(201);
		resp.send(shelf.fields);
	}
	
	async modifyShelf(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const shelf = new ShelfModel();
		if(!shelf.update(req.body)) return;
		await this.updateShelf(req.params.zoneId, req.params.bayId, req.params.shelfId, shelf.fields);
		resp.status(200);
		resp.send(shelf.fields);
	}
	
	async deleteShelf(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.deleteShelfFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		resp.sendStatus(204);
	}

    async getShelvesFromDb(zone, bay){
        let shelves = [];
        const query = '{\'' + zone + '.' + bay + '\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                for(let key in result[zone][bay]){
					const shelfData = {_id: key};
					for(let shelfInfoKey in result[zone][bay][key]) {
						if(shelfInfoKey.startsWith('_')) {
							shelfData[shelfInfoKey] = result[zone][bay][key][shelfInfoKey];
						}
					}
                    shelves.push(shelfData);
                }
            });
        } catch (err){
            console.log(err);
        }
        return shelves;
    }
	
	async getShelfFromDb(zoneId, bayId, shelfId) {
		let shelf = {};
		
		const query = '{\'' + zoneId + '.' + bayId + '.' + shelfId + '\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                for(let key in result[zoneId][bayId][shelfId]){
                    if(key.startsWith('_')) {
						shelf[key] = result[zoneId][bayId][shelfId][key];
					}
                }
            });
        } catch (err){
            console.log(err);
        }
        return shelf;
	}
	
	async updateShelf(zoneName, bayName, shelfNumber, shelfData){
		if(shelfData._id) {
			let filter = {};
			let renameStringLeft = zoneName + '.' + bayName + '.' + oldShelfName;
			let renameStringRight = zoneName + '.' + bayName + '.' + newShelfName;
			let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
			await this.db.updateDatabase('warehouse', filter, updateQuery);
		}
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber;
        let filter = {[insertStringLeft]:{$exists: true}};
        let setObj = {}
        for(let key in shelfData){
			if(key === '_id') continue;
            setObj[insertStringLeft + '.' + key] = shelfData[key];
        }
		if(Object.keys(setObj).length > 0) {
			let updateQuery = {$set: setObj};
			await this.db.updateDatabase('warehouse', filter, updateQuery);
		}
    }

    async insertShelf(zoneName, bayName, shelfNumber){
        
        let insertStringLeft = zoneName + '.' + bayName + '.' + shelfNumber;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertShelves(zoneName, bayName, shelfNumberMax){
        for(let shelf = 1; shelf <= shelfNumberMax; shelf++){
            let toSet = zoneName + '.' + bayName + '.' + shelf;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }

    async deleteShelfFromDb(zoneName, bayName, shelfNumber){
        let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
    /*
    async deleteShelves(zoneName, bayName, shelfNumberStart, shelfNumberEnd){
        for(let shelf = shelfNumberStart; shelf <= shelfNumberEnd; shelf++){
            let deleteStringLeft = zoneName + '.' + bayName + '.' + shelf;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: '' } };
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }*/

    async deleteShelves(zoneName, bayName, newShelfNumber){
        let originalShelves = await this.getShelvesFromDb(zoneName, bayName);
        let numOfOrigShelves = originalShelves.length;
        if(newShelfNumber >= numOfOrigShelves)
            return;
        for(let shelf = numOfOrigShelves; shelf > newShelfNumber; shelf--){
            this.deleteShelfFromDb(zoneName, bayName, shelf);
        }
    }

    async insertShelves(zoneName, bayName, newShelfNumber){
        let originalShelves = await this.getShelvesFromDb(zoneName, bayName);
        let numOfOrigShelves = originalShelves.length;
        if(newShelfNumber <= numOfOrigShelves)
            return;
        for(let shelf = numOfOrigShelves + 1; shelf <= newShelfNumber; shelf++){
            await this.insertShelf(zoneName, bayName, shelf);
        }
    }
}

module.exports = ShelfController;