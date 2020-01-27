class ColumnController {

    constructor(db){
        this.db = db;
    }

    async getColumns(zone, bay, shelf, row){
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