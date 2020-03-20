const AppError = require('../errors/AppError');
const appError = new AppError();
const UserModel = require('../models/UserModel');
const argon2 = require('argon2');
//const UserModel...

class UserController{
    constructor(db){
        this.db = db;
    }

    async getAllUsers(req, resp) {
        if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
        }
        const users = await this.getAllUsersFromDb();
        resp.status(200);
        resp.send(users);
    }

    async getUser(req, resp) {
        if(!req.jwtDecoded.canViewData) {
			return appError.forbidden(resp, 'You do not have permission to view data');
		}
		const user = await this.getUserFromDb(req.params.zoneId, req.params.bayId, req.params.shelfId, req.params.rowId, req.params.columnId);
		resp.status(200);
		resp.send(user);
    }

    async getUserFromDb(userName){
        //TAKEN FROM AUTH CONTROLLER
        let connection = this.db.getConnection();
        let user = null;
        try{
            const db = connection.db('foodbank');
            const collection = db.collection('users');
            user = await collection.findOne({'email': userName});
        } catch(err) {
            console.log(err);
        }
        return user
    }

    async getAllUsersFromDb(){
        let users = [];
        let connection = this.db.getConnection();
        try{
            const db = connection.db('foodbank');
            //const collection = db.collection('users');
//            user = await collection.forEach(function(doc){
//                users.push(doc);    //will need to split the data (user["username"] etc..
//            });
            //foreach u in collection, push to users
            //users.push(collection);
            let cursor = await this.db.queryDatabase('users');
            await cursor.forEach(function(doc){
                //users.push(doc);
                let user = {};
                user["username"] = doc["email"];
                user["firstName"] = doc["firstName"];
                user["lastName"] = doc["lastName"]; //to add password!
                user["role"] = doc["role"];
                user["canViewData"] = doc["canViewData"];   //TO ADD CHECK THAT THIS IS BOOL AND NOT STRING
                user["canEditData"] = doc["canEditData"];
                user["canModifyWarehouse"] = doc["canModifyWarehouse"];
                user["canModifyUsers"] = doc["canModifyUsers"]; 
                users.push(user);
            });
        }catch(err){
            console.log(err);
        }
        return users
    }

    async addUser(req, resp){
        if(!req.jwtDecoded.canEditData) {
			return appError.forbidden(resp, 'You do not have permission to edit data');
        };
        const user = new UserModel();
        if(!user.map(req.body)){
            return appError.badRequest(resp, 'Invalid field in user', user.validator.errors)
        };
        var password = await this.createPassword(resp, req.body.password);
        console.log(password);
        await this.insertUser(req.body.firstName, req.body.lastName, req.body.username, password, req.body.role, req.body.canViewData, req.body.canEditData, req.body.canModifyWarehouse, req.body.canModifyUsers);
        resp.status(201);
        resp.send(req.body);
    }

    async createPassword(resp, password) {
		try {
			return await argon2.hash(password, {type: argon2.argon2id});
		}
		catch(err) {
			return appError.internalServerError(resp, 'Hashing password failed', err);
		}
	}

    async insertUser(firstName, lastName, username, password, role, canViewData, canEditData, canModifyWarehouse, canModifyUsers){
        let connection = this.db.getConnection();
        const db = connection.db('foodbank');
        const collection = db.collection('users');
        collection.insertOne({email: username, password: password, firstName: firstName, lastName: lastName, role: role, canViewData: canViewData, canEditData: canEditData, canModifyWarehouse:canModifyWarehouse, canModifyUsers:canModifyUsers}); //to change email to username
    }

    async updateUser(req, resp){
        if(!req.jwtDecoded.canEditData) {
			return appError.forbidden(resp, 'You do not have permission to edit data');
        };
        const user = new UserModel();
        if(!user.map(req.body)){
            return appError.badRequest(resp, 'Invalid field in user', user.validator.errors)
        };
        await this.updateUserFromDb(req.body.username, req.body.firstName, req.body.lastName, req.body.role, req.body.canViewData, req.body.canEditData, req.body.canModifyWarehouse, req.body.canModifyUsers);
        resp.status(201);
        resp.send(req.body);
    }

    async updateUserFromDb(username, firstName, lastName, role, canViewData, canEditData, canModifyWarehouse, canModifyUsers){
        let connection = this.db.getConnection();
        const db = connection.db('foodbank');
        const collection = db.collection('users');
        collection.updateOne({email: username}, {$set: {firstName:firstName, lastName:lastName, role:role, canViewData:canViewData, canEditData:canEditData, canModifyWarehouse:canModifyWarehouse, canModifyUsers:canModifyUsers}});
    }

    async getAllUsersFromDbTEMP(){
        //TAKEN FROM TRAY CONTROLLER...
        let users = [];

        try{
            let cursor = await this.db.queryDatabase('users', {});
            await cursor.forEach(function(doc){
                for(let id in doc){
                    let user = doc[id] //I'm certain this won't work :(
                    users.push(user);
                }
                console.log(users);
            });
        }catch(err){
            console.log(err);
        }
        return users;
    }
}

module.exports = UserController;