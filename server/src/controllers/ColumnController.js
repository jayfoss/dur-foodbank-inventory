class ColumnController {

    constructor(db){
        this.db = db;
    }

	async getColumns(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const columns = await this.getColumnsFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId);
		resp.status(200);
		resp.send(columns);
	}
	
	async createColumn(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const column = new ColumnModel();
		if(!column.map(req.body)) return;
		await this.insertColumn(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, column.column);
		resp.status(201);
		resp.send(column.fields);
	}
	
	async modifyColumn(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		const column = new ColumnModel();
		if(!column.map(req.body)) return;
		await this.changeColumnName(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId, column.column);
		resp.status(201);
		resp.send(row.fields);
	}
	
	async deleteColumn(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.deleteColumnFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId);
		resp.sendStatus(204);
	}

    async getColumnsFromDb(zone, bay, shelf, row){
        let columns = [];
        const query = '{\'' + zone + '.' + bay + '.' + shelf + '.' + row + '\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                for(let key in result[zone][bay][shelf][row]){
                    columns.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return columns;
    }

    async changeColumnName(zoneName, bayName, shelfNumber, rowNumber, oldColumnName, newColumnName) {
        let filter = {};
        let renameStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + oldColumnName;
        let renameStringRight = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + newColumnName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertColumn(zoneName, bayName, shelfNumber, rowNumber, newColumnNumber){
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + newColumnNumber;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertColumns(zoneName, bayName, shelfNumber, rowNumber, columnNumberMax){
        for(let column = 1; column <= columnNumberMax; column++){
            let toSet = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + column;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }

    async deleteColumn(zoneName, bayName, shelfNumber, rowNumber, columnNumber){
        let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteColumns(zoneName, bayName, shelfNumber, rowNumber, columnNumberStart, columnNumberEnd){
        for(let column = columnNumberStart; column <= columnNumberEnd; column++){
            let deleteStringLeft = zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + column;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: '' } };
            await this.db.updateDatabase('warehouse', filter, updateQuery);
        }
    }
}

module.exports = ColumnController;