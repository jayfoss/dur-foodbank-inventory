const DatabaseController = require("./DatabaseController");

class TrayController extends DatabaseController {

    constructor(){
        super();
    }

    async getTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber){
        const connection = await this.createConnection();
        if(!connection) return;

        let tray = {};
        const query = "{\"" + zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + "\" : {$exists: true}}";

        try {
            let cursor = await this.queryDatabase(connection, "warehouse", query);
            await cursor.forEach(function(result){
                tray = result[zoneName][bayName][shelfNumber][rowNumber][columnNumber];
            });
        } catch (err){
            console.log(err);
        } finally {
            connection.close();
        }
        console.log(tray);
        return tray;
    }

    async setTrayCategory(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newCategory) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".category";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newCategory } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayWeight(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newWeight) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".weight";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newWeight } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayExpiryYear(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newExpiryYearStart, newExpiryYearEnd) {
        let expiryYear = {"start":newExpiryYearStart, "end":newExpiryYearEnd};
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".expiryYear";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryYear } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayExpiryMonth(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newExpiryMonthStart, newExpiryMonthEnd) {
        let expiryMonth = {"start":newExpiryMonthStart, "end":newExpiryMonthEnd};
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".expiryMonth";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryMonth } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayLastUpdated(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newLastUpdated) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".lastUpdated";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newLastUpdated } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayNote(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newNote) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".userNote";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newNote } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber, newTray) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber;
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newTray } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async clearTray(zoneName, bayName, shelfNumber, rowNumber, columnNumber) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber;
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: {}} };
        await this.updateDatabase("warehouse", filter, updateQuery);
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