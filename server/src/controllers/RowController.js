const AppError = require('../errors/AppError');
const appError = new AppError();
const RowModel = require('../models/RowModel');

class RowController {

    constructor(db){
        this.db = db;
    }
	
	getRows(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const rows = getRowsFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		resp.status(200);
		resp.send(rows);
	}
	
	createRow(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const row = new RowModel();
		if(!row.map(req.body)) return;
		this.insertShelf(req.params.zoneId, req.params.bayId, req.params.shelfId, row.row);
		resp.status(201);
		resp.send(row.fields);
	}

    async getRowsFromDb(zone, bay, shelf){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let rows = [];
        const query = '{\'' + zone + '.' + bay + '.' + shelf +'\' : {$exists: true}}';

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', query);
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
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertRows(zoneName, bayName, shelfNumber, rowNumberMax){
        for(let row = 1; row <= rowNumberMax; row++){
            let toSet = zoneName + '.' + bayName + '.' + shelfNumber + '.' + row;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }

    async deleteRowFromDb(zoneName, bayName, shelfNumber, rowNumber){
        let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteRows(zoneName, bayName, shelfNumber, rowNumberStart, rowNumberEnd){
        for(let row = rowNumberStart; row <= rowNumberEnd; row++){
            let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + row;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: '' } };
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }
}

module.exports = RowController;