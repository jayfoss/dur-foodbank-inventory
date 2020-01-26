class ZoneController {

    constructor(db){
        this.db = db;
    }

    async getZones(){
        const connection = await this.db.getConnection();
        if(!connection) return;

        let zones = [];

        try {
            let cursor = await this.queryDatabase(connection, 'warehouse', {});

            await cursor.forEach(function(result){
                for(let key in result){
                    zones.push(key);
                }
            });
        } catch (err){
            console.log(err);
        }
        return zones;
    }

    async insertZone(zoneName) {
        let filter = {[zoneName]: { $exists: false }};
        let updateQuery = { $set: { [zoneName]: {} } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async changeZoneName(oldZoneName, newZoneName) {
        let filter = {};
        let updateQuery = { $rename: { [oldZoneName]:newZoneName } };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }

    async deleteZone(zoneName) {
        let filter = {};
        let updateQuery =  { $unset : { [zoneName]:''} };
        await this.db.updateDatabase('warehouse', filter, updateQuery);
    }
}

module.exports = ZoneController;