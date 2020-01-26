const config = require('../../config');
const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;

class DatabaseController {
    constructor(){
        this.databaseName = 'foodbank';
        this.databaseURL = 'mongodb://' + config.db.host + ':' + config.db.port;
		this.connection = null;
    }

    createConnection(){
		return new Promise((resolve, reject) => {
			mongoClient.connect(this.databaseURL, {useUnifiedTopology: true}, (err, db) => {
				if(err) {
					reject(err);
					return;
				}
				this.connection = db;
			});
		});
    }
	
	getConnection() {
		if(this.connection === null) {
			throw new Error('Database connection hasn\'t been created');
		}
		
		return this.connection;
	}

    async queryDatabase(collectionName, query) {
		const connection = await this.getConnection();
        let cursor = null;
        try{
            const db = connection.db(this.databaseName);
            const collection = db.collection(collectionName);

            cursor = collection.find(query);
        } catch (err) {
            console.log(err);
        }
        return cursor;
    }

    async updateDatabase(collectionName, filter, updateQuery) {
        const connection = await this.getConnection();
        try {
            const db = connection.db(this.databaseName);
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