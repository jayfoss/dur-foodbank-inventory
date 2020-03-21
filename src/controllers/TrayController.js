const AppError = require('../errors/AppError');
const appError = new AppError();
const TrayModel = require('../models/TrayModel');

class TrayController {

    constructor(db){
        this.db = db;
    }

	async getAllTrays(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const trays = await this.getAllTraysFromDb();
		resp.status(200);
		resp.send(trays);
	}
	
	async getTraysOnShelf(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const trays = await this.getTraysOnShelfFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		resp.status(200);
		resp.send(trays);
	}
	
	async updateTraysOnShelf(req, resp) {
		if(!req.jwtDecoded.canEditData) {
			return appError.forbidden(resp, 'You do not have permission to edit data');
		}
		const traysOnShelf = await this.getTraysOnShelfFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId);
		if(req.body.length !== traysOnShelf.length) {
			return appError.unprocessableEntity(resp, 'Expected ' + traysOnShelf.length + ' rows, you gave ' + req.body.length + '.');
		}
		const newTrays = {};
		const updateTime = new Date();
		for(let row in req.body) {
			if(req.body[row].length !== traysOnShelf[row].length) {
				return appError.unprocessableEntity(resp, 'Expected ' + traysOnShelf[row].length + ' columns, you gave ' + req.body[row].length + ' on row ' + row + '.');
			}
			const newRow = {};
			for(let col in req.body[row]) {
				const tray = new TrayModel();
				if(!tray.map(req.body[row][col])) {
					return appError.badRequest(resp, 'You passed an invalid tray', tray.validator.errors);
				}
				tray.fields.lastUpdated = updateTime.getTime();
				newRow['' + col] = tray.fields;
			}
			newTrays['' + row] = newRow;
		}
		await this.updateTraysOnShelfInDb(req.params.zoneId, req.params.bayId, req.params.shelfId, newTrays);
		resp.status(200);
		resp.send(newTrays);
	}
	
	async getTray(req, resp) {
		if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const tray = await this.getTrayFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId);
		resp.status(200);
		resp.send(tray);
	}
	
	async createTray(req, resp) {
		if(!req.jwtDecoded.canEditData) {
			return appError.forbidden(resp, 'You do not have permission to edit data');
		}
		const tray = new TrayModel();
		
		if(!tray.map(req.body)) return appError.badRequest(resp, 'Invalid data in tray', tray.validator.errors);
		await this.insertTray(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId, tray.fields);
		resp.status(201);
		resp.send(tray);
	}
	
	async modifyTray(req, resp) {
		if(!req.jwtDecoded.canEditData) {
			return appError.forbidden(resp, 'You do not have permission to edit data');
		}
		const tray = new TrayModel();
		if(!tray.map(req.body)) return appError.badRequest(resp, 'Invalid data in tray', tray.validator.errors);
		await this.updateTray(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId, tray.fields);
		resp.status(200);
		resp.send(tray);
	}
	
	async deleteTray(req, resp) {
		if(!req.jwtDecoded.canModifyWarehouse) {
			return appError.forbidden(resp, 'You do not have permission to modify the warehouse');
		}
		await this.clearTray(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId);
		resp.sendStatus(204);
	}

    async getTrayFromDb(zoneName, bayName, shelfNumber, rowNumber, columnNumber){
        let tray = {};
        const query = '{\'' + zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '\' : {$exists: true}}';

        try {
            let cursor = await this.db.queryDatabase('warehouse', query);
            await cursor.forEach(function(result){
                tray = result[zoneName][bayName][shelfNumber][rowNumber][columnNumber];
            });
        } catch (err){
            console.log(err);
        }
        return tray;
    }

    async getReportData(req, resp){
        if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
        let trays = await this.getAllTraysFromDb();
        let filteredTrays = {};
        trays.forEach((tray) => {
            if(tray.category != ''){
                if(!filteredTrays[tray.zone]){
                    filteredTrays[tray.zone] = {};
                }
                if(!filteredTrays[tray.zone][tray.category]){
                    filteredTrays[tray.zone][tray.category] = 0;
                }
                filteredTrays[tray.zone][tray.category] += 1;
            }
        });
        resp.status(200);
		resp.send(filteredTrays);
    }

    async getAllTraysFromDb(){
        let trays = [];

        try{
            let cursor = await this.db.queryDatabase('warehouse', {});
            await cursor.forEach(function(doc){
                for(let zoneName in doc){
                    if(zoneName === "_id") continue;
                    for(let bayName in doc[zoneName]){
                        
                        if(bayName === "_color") continue;
                        for(let shelfNumber in doc[zoneName][bayName]){
                            for(let rowNumber in doc[zoneName][bayName][shelfNumber]){
                                for(let columnNumber in doc[zoneName][bayName][shelfNumber][rowNumber]){
                                    let tray = doc[zoneName][bayName][shelfNumber][rowNumber][columnNumber]
                                    tray["zone"] = zoneName;
                                    tray["bay"] = bayName;
                                    tray["shelf"] = shelfNumber;
                                    tray["row"] = rowNumber;
                                    tray["column"] = columnNumber;
                                    trays.push(tray);
                                }
                            }
                        }
                    }
                }
            });
        }catch(err){
            console.log(err);
        }
        return trays;
    }
	
	async getTraysOnShelfFromDb(zoneName, bayName, shelfNumber){
		try {
			const str = zoneName + '.' + bayName + '.' + shelfNumber;
            const query = {};
			query[str] = {$exists: true};
			
            let cursor = await this.db.queryDatabase('warehouse', query);
			let shelf = [];
            await cursor.forEach(function(result){
				if(result.length === 0) return shelf;
                let numOfRows = Object.keys(result[zoneName][bayName][shelfNumber]).length;
                let numOfColumns = 0;
                if(numOfRows > 0) {
                    numOfColumns = Object.keys(result[zoneName][bayName][shelfNumber][0]).length;
                }

                for(let rowNumber in result[zoneName][bayName][shelfNumber]){
					let row = [];
					if(rowNumber.startsWith('_')) {
						continue;
					}
                    for(let columnNumber in result[zoneName][bayName][shelfNumber][rowNumber]){
						result[zoneName][bayName][shelfNumber][rowNumber][columnNumber]['row'] = '' + rowNumber;
						result[zoneName][bayName][shelfNumber][rowNumber][columnNumber]['col'] = '' + columnNumber;
                        row.push(result[zoneName][bayName][shelfNumber][rowNumber][columnNumber]);
                    }
					shelf.push(row);
                }
            });
            return shelf;
            
        } catch(err) {
            console.log(err);
            return null;
        }
    }
	
	async updateTraysOnShelfInDb(zoneId, bayId, shelfId, body) {
		let insertStringLeft =  zoneId + '.' + bayId + '.' + shelfId;
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: body } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
		return body;
	}

    async setTrayCategory(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newCategory) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.category';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newCategory } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async setTrayWeight(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newWeight) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.weight';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newWeight } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async setTrayExpiryYear(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newExpiryYearStart, newExpiryYearEnd) {
        let expiryYear = {'start':newExpiryYearStart, 'end':newExpiryYearEnd};
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.expiryYear';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryYear } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async setTrayExpiryMonth(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newExpiryMonthStart, newExpiryMonthEnd) {
        let expiryMonth = {'start':newExpiryMonthStart, 'end':newExpiryMonthEnd};
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.expiryMonth';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryMonth } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async setTrayLastUpdated(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newLastUpdated) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.lastUpdated';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newLastUpdated } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async setTrayNote(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newNote) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber + '.userNote';
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newNote } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newTray) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber;
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newTray } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async clearTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber) {
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber;
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: {}} };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async updateTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber, updatedTrayObj){
        let insertStringLeft =  zoneName + '.' + bayName + '.' + shelfNumber + '.' + rowNumber + '.' + columnNumber;
        let filter = {[insertStringLeft]:{$exists: true}};
        let setObj = {}
        for(let key in updatedTrayObj){
            setObj[insertStringLeft + "." + key] = updatedTrayObj[key];
        }
        let updateQuery = {$set:setObj };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
}

module.exports = TrayController;