const DatabaseController = require("./DatabaseController");

class RowController extends DatabaseController {

    constructor(){
        super();
    }

    async getRows(zone, bay, shelf){
        const connection = await this.createConnection();
        if(!connection) return;

        let rows = [];
        const query = "{\"" + zone + "." + bay + "." + shelf +"\" : {$exists: true}}";

        try {
            let cursor = await this.queryDatabase(connection, "warehouse", query);
            await cursor.forEach(function(result){
                for(let key in result[zone][bay][shelf]){
                    rows.push(key);
                }
            });
        } catch (err){
            console.log(err);
        } finally {
            connection.close();
        }
        console.log(rows);
        return rows;
    }

    async changeRowName(zoneName, bayName, shelfNumber, oldRowName, newRowName) {
        let filter = {};
        let renameStringLeft = zoneName + "." + bayName + "." + shelfNumber + "." + oldRowName;
        let renameStringRight = zoneName + "." + bayName + "." + shelfNumber + "." + newRowName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async insertRow(zoneName, bayName, shelfNumber, newRowNumber){
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + newRowNumber;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async insertRows(zoneName, bayName, shelfNumber, rowNumberMax){
        for(var row = 1; row <= rowNumberMax; row++){
            let toSet = zoneName + "." + bayName + "." + shelfNumber + "." + row;
            let filter = {[toSet]:{$exists: false}};
            let updateQuery = {$set : { [toSet]: {}}};
            await this.updateDatabase("warehouse", filter, updateQuery);
        }
    }

    async deleteRow(zoneName, bayName, shelfNumber, rowNumber){
        let deleteStringLeft = zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: "" } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async deleteRows(zoneName, bayName, shelfNumber, rowNumberStart, rowNumberEnd){
        for(var row = rowNumberStart; row <= rowNumberEnd; row++){
            let deleteStringLeft = zoneName + "." + bayName + "." + shelfNumber + "." + row;
            let filter = {};
            let updateQuery = { $unset: { [deleteStringLeft]: "" } };
            await this.updateDatabase("warehouse", filter, updateQuery);
        }
    }
}

module.exports = RowController;