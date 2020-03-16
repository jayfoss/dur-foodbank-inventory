const AppError = require('../errors/AppError');
const appError = new AppError();
const ShelfModel = require('../models/ShelfModel');

class ShelfController {

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
            '1': {
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData,
                '4': this.basicTrayData
            },
            '2': {
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData,
                '4': this.basicTrayData
            },
            '3': {
                '1': this.basicTrayData,
                '2': this.basicTrayData,
                '3': this.basicTrayData,
                '4': this.basicTrayData
            },
        };
    }

	async getShelves(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const shelves = await this.getShelvesFromDb(req.params.zoneId, req.params.bayId);
		resp.status(200);
		resp.send(shelves);
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
    
    async createManyShelves(req, resp) {
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const shelf = new ShelfModel();
		if(!shelf.map(req.body)) return;
		await this.insertShelves(req.params.zoneId, req.params.bayId, req.params.numberOfShelves);
		resp.status(201);
		resp.send(shelf.fields);
    }

    async deleteManyShelves(req, resp){
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const shelf = new ShelfModel();
		if(!shelf.map(req.body)) return;
		await this.deleteShelves(req.params.zoneId, req.params.bayId, req.params.numberOfShelves);
		resp.status(201);
		resp.send(shelf.fields);
    }
	
	async modifyShelf(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const shelf = new ShelfModel();
		if(!shelf.map(req.body)) return;
		await this.changeShelfName(req.params.zoneId, req.params.bayId, req.params.shelfId, shelf.number);
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
                    shelves.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return shelves;
    }

    async changeShelfName(zoneName, bayName, oldShelfName, newShelfName) {
        let filter = {};
        let renameStringLeft = zoneName + '.' + bayName + '.' + oldShelfName;
        let renameStringRight = zoneName + '.' + bayName + '.' + newShelfName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertShelf(zoneName, bayName, shelfNumber){
        
        let insertStringLeft = zoneName + '.' + bayName + '.' + shelfNumber;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: this.basicShelfData } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
/*
    async insertShelves(zoneName, bayName, shelfNumberMax){
        for(let shelf = 1; shelf <= shelfNumberMax; shelf++){
            let toSet = zoneName + '.' + bayName + '.' + shelf;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }*/

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