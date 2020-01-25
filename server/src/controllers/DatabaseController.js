const config = require('../../config');
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;

class DatabaseController {
    constructor(){
        this.databseName = "foodbank";
        this.databaseURL = "mongodb://" + config.db.host + ":" + config.db.port;
    }

    async createConnection(){
        const connection = await mongoClient.connect(this.databaseURL, {useUnifiedTopology: true})
            .catch(err => console.log(err));
        return connection;
    }

    async queryDatabase(connection, collectionName, query) {
        let cursor = null;
        try{
            const db = connection.db(this.databseName);
            const collection = db.collection(collectionName);

            cursor = collection.find(query);
        } catch (err) {
            console.log(err);
        }
        return cursor;
    }

    async updateDatabase(collectionName, filter, updateQuery) {
        const connection = await this.createConnection();
        try {
            const db = connection.db(this.databseName);
            const collection = db.collection(collectionName);

            await collection.updateOne(filter, updateQuery);
        } catch (err) {
            console.log(err);
        } finally {
            connection.close();
        }
    }
}

module.exports = DatabaseController;