class BayController {

    constructor(db){
        this.db = db;
    }

    async getBays(zone){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let bays = [];

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', {});
            await cursor.forEach(function(result){
                for(let key in result[zone]){
                    bays.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return bays;
    }

    async changeBayName(zoneName, oldBayName, newBayName) {
        let filter = {};
        let renameStringLeft = zoneName + '.' + oldBayName;
        let renameStringRight = zoneName + '.' + newBayName;
        let updateQuery = { $rename : { [renameStringLeft] : renameStringRight}}
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async insertBay(zoneName, newBayName){
        let insertStringLeft = zoneName + '.' + newBayName;
        let filter = {[insertStringLeft]: { $exists: false }};
        let updateQuery = { $set: { [insertStringLeft]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteBay(zoneName, bayName){
        let deleteStringLeft = zoneName + '.' + bayName;
        let filter = {};
        let updateQuery = { $unset: { [deleteStringLeft]: '' } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
}

module.exports = BayController;