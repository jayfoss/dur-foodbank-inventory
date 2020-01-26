class ShelfController {

    constructor(db){
        this.db = db;
    }

    async getShelves(zone, bay){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let shelves = [];
        const query = '{\'' + zone + '.' + bay + '\' : {$exists: true}}';

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', query);
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

    async deleteShelf(zoneName, bayName, shelfNumber){
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