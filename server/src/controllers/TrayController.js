const DatabaseController = require("./DatabaseController");

class TrayController extends DatabaseController {

    constructor(){
        super();
    }

    async getTray(zone, bay, shelf, row, column){
        const connection = await this.createConnection();
        if(!connection) return;

        let tray = {};
        const query = "{\"" + zone + "." + bay + "." + shelf + "." + row + "." + column + "\" : {$exists: true}}";

        try {
            let cursor = await this.queryDatabase(connection, "warehouse", query);
            await cursor.forEach(function(result){
                tray = result[zone][bay][shelf][row][column];
            });
        } catch (err){
            console.log(err);
        } finally {
            connection.close();
        }
        console.log(tray);
        return tray;
    }

    async setTrayCategory(zone, bay, shelf, row, column, newCategory) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".category";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newCategory } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayWeight(zone, bay, shelf, row, column, newWeight) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".weight";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newWeight } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayExpiryYear(zone, bay, shelf, row, column, newExpiryYearStart, newExpiryYearEnd) {
        let expiryYear = {"start":newExpiryYearStart, "end":newExpiryMonthEnd};
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".expiryYear";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryYear } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayExpiryMonth(zone, bay, shelf, row, column, newExpiryMonthStart, newExpiryMonthEnd) {
        let expiryMonth = {"start":newExpiryMonthStart, "end":newExpiryMonthEnd};
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".expiryMonth";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: expiryMonth } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayLastUpdated(zone, bay, shelf, row, column, newLastUpdated) {
        let insertStringLeft =  zoneName + "." + bayName + "." + shelfNumber + "." + rowNumber + "." + columnNumber + ".lastUpdated";
        let filter = {[insertStringLeft]: { $exists: true }};
        let updateQuery = { $set: { [insertStringLeft]: newLastUpdated } };
        await this.updateDatabase("warehouse", filter, updateQuery);
    }

    async setTrayNote(zone, bay, shelf, row, column, newNote) {
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
}

module.exports = TrayController;