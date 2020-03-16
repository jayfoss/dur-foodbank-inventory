const AppError = require('../errors/AppError');
const appError = new AppError();
const RowModel = require('../models/RowModel');

class RowController {

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
        this.basicRow = {
            '1': this.basicTrayData,
            '2': this.basicTrayData,
            '3': this.basicTrayData,
            '4': this.basicTrayData,
        }
    }

    async createManyRows(req, resp) {
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const row = new RowModel();
		if(!row.map(req.body)) return;
		await this.insertRows(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.numberOfRows);
		resp.status(201);
		resp.send(row.fields);
    }

    async deleteManyRows(req, resp) {
        if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const row = new RowModel();
		if(!row.map(req.body)) return;
		await this.deleteRows(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.numberOfRows);
		resp.status(201);
		resp.send(row.fields);
    }
	
	async getRows(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const rows = await this.getRowsFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		resp.status(200);
		resp.send(rows);
	}
	
	async createRow(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const row = new RowModel();
		if(!row.map(req.body)) return;
		await this.insertRow(req.params.zoneId, req.params.bayId, req.params.shelfId, row.row);
		resp.status(201);
		resp.send(row.fields);
	}
	
	async modifyRow(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const row = new RowModel();
		if(!row.map(req.body)) return;
		await this.changeRowName(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, row.row);
		resp.status(201);
		resp.send(row.fields);
	}
	
	async deleteRow(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.deleteRowFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId);
		resp.sendStatus(204);
	}

    async getRowsFromDb(zone, bay, shelf){
        let rows = [];
        const query = '{\'' + zone + '.' + bay + '.' + shelf +'\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                for(let key in result[zone][bay][shelf]){
                    rows.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return rows;
    }

    async changeRowName(zoneName, bayName, shelfNumber, oldRowName, newRowName) {
        let filter = {};
        let renameStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + oldRowName;
        let renameStringRight = zoneName + '.' + bayName + '.' + shelfNumber + '.' + newRowName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertRow(zoneName, bayName, shelfNumber, newRowNumber){
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + newRowNumber;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: this.basicRow } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
/*
    async insertRows(zoneName, bayName, shelfNumber, rowNumberMax){
        for(let row = 1; row <= rowNumberMax; row++){
            let toSet = zoneName + '.' + bayName + '.' + shelfNumber + '.' + row;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }
*/
    async deleteRowFromDb(zoneName, bayName, shelfNumber, rowNumber){
        let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
/*
    async deleteRows(zoneName, bayName, shelfNumber, rowNumberStart, rowNumberEnd){
        for(let row = rowNumberStart; row <= rowNumberEnd; row++){
            let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + row;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: '' } };
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }
*/
    async deleteRows(zoneName, bayName, shelfNumber, newRowNumber){
        let originalRows = await this.getRowsFromDb(zoneName, bayName, shelfNumber);
        let numOfOrigRows = originalRows.length;
        if(newRowNumber >= numOfOrigRows)
            return;
        for(let row = numOfOrigRows; row > newRowNumber; row--){
            await this.deleteRowFromDb(zoneName, bayName, shelfNumber, row);
        }
    }

    async insertRows(zoneName, bayName, shelfNumber, newRowNumber){
        let originalRows = await this.getRowsFromDb(zoneName, bayName, shelfNumber);
        let numOfOrigRows = originalRows.length;
        if(newRowNumber <= numOfOrigRows)
            return;
        for(let row = numOfOrigRows + 1; row <= newRowNumber; row++){
            await this.insertRow(zoneName, bayName, shelfNumber, row);
        }
    }

// TEMP
async deleteShelves(zoneName, bayName, newShelfNumber){
    let originalShelves = await this.getShelvesFromDb();
    let numOfOrigShelves = originalShelves.length;
    if(newShelfNumber >= numOfOrigShelves)
        return;
    for(let shelf = numOfOrigShelves; shelf > newShelfNumber; shelf--){
        this.deleteShelfFromDb(zoneName, bayName, shelf);
    }
}

async insertShelves(zoneName, bayName, newShelfNumber){
    let originalShelves = await this.getShelvesFromDb();
    let numOfOrigShelves = originalShelves.length;
    if(newShelfNumber <= numOfOrigShelves)
        return;
    for(let shelf = numOfOrigShelves; shelf <= newShelfNumber; shelf++){
        await this.insertShelf(zoneName, bayName, shelf);
    }
}
}

module.exports = RowController;