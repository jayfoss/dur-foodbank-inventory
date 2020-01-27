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

    async deleteShelves(zoneName, bayName, shelfNumberStart, shelfNumberEnd){
        for(let shelf = shelfNumberStart; shelf <= shelfNumberEnd; shelf++){
            let deleteStringLeft = zoneName + '.' + bayName + '.' + shelf;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: '' } };
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }
}

module.exports = ShelfController;