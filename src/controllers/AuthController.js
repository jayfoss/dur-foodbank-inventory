const jwt = require('jsonwebtoken');
const config = require('../../config');
const argon2 = require('argon2');
const AppError = require('../errors/AppError');
const appError = new AppError();
const UserModel = require('../models/UserModel');
const ObjectID = require('mongodb').ObjectID;

class AuthController {
	constructor(db){
		this.db = db;
	}

	async login(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		let user = await this.getUserFromDb(req.body.username);
		if(!user) {
			return appError.unauthorized(resp, 'Invalid email or password');
		}
		const pwdMatch = await this.passwordMatches(resp, req.body.password, user.password);
		if(pwdMatch === null) return;
		if(pwdMatch) {
			user.password = '';
			delete user.password;
			const auth = this.createAuth(user);
			resp.cookie('_id', auth['id'], {httpOnly: true, secure: config.auth.secureCookie});
			resp.cookie('_p', auth['p'], {httpOnly: false, secure: config.auth.secureCookie});
			resp.status(201);
			resp.send(user);
		}
		else {
			return appError.unauthorized(resp, 'Invalid email or password');
		}
	}
	
	logout(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		resp.cookie('_id', false, {expires: new Date(Date.now() - 86000), httpOnly: true, secure: config.auth.secureCookie}); 
		resp.cookie('_p', false, {expires: new Date(Date.now() - 86000), httpOnly: false, secure: config.auth.secureCookie});
		resp.sendStatus(204);
	}
	
	createAuthToken(user){
		const payload = {
			id: user._id,
			canViewData: user.canViewData,
			canEditData: user.canEditData,
			canModifyWarehouse: user.canModifyWarehouse,
			canModifyUsers: user.canModifyUsers
		};
		let token = jwt.sign(payload, config.auth.jwtSecret, {
			expiresIn: config.auth.maxAge
		});
		return token;
	}
	
	createAuth(user) {
		const tok = this.createAuthToken(user).split('.');
		const a = {};
		a['id'] = tok[0] + '.' + tok[2];
		a['p'] = tok[1];
		return a;
	}
	
	async getUsers(req, resp) {
		if(!req.jwtDecoded.canModifyUsers) {
			return appError.forbidden(resp, 'You do not have permission to modify users');
        }
        const users = await this.getUsersFromDb();
		for(let i in users) {
			delete users[i].password;
		}
        resp.status(200);
        resp.send(users);
	}
	
	async createUser(req, resp) {
		if(!req.jwtDecoded.canModifyUsers) {
			return appError.forbidden(resp, 'You do not have permission to modify users');
        }
		const user = new UserModel();
		if(!user.map(req.body)){
            return appError.badRequest(resp, 'Invalid field in user', user.validator.errors);
        };
		const password = await this.createPassword(resp, req.body.password);
		user.fields.password = password;
        const inserted = await this.insertUserIntoDb(user.fields);
		if(!inserted) {
			return appError.unprocessableEntity(resp, 'Failed to create user. Username may already exist');
		}
        resp.status(201);
        resp.send(user);
	}
	
	async updateUser(req, resp){
        if(!req.jwtDecoded.canModifyUsers) {
			return appError.forbidden(resp, 'You do not have permission to modify users');
        };
        const user = new UserModel();
        if(!user.update(req.body)){
            return appError.badRequest(resp, 'Invalid field in user', user.validator.errors);
        };
        await this.updateUserFromDb(req.params.userId, user.fields);
        resp.status(200);
        resp.send(user);
    }
	
	async deleteUser(req, resp) {
		if(!req.jwtDecoded.canModifyUsers) {
			return appError.forbidden(resp, 'You do not have permission to modify users');
		}
		if(req.params.userId === req.jwtDecoded.id) {
			return appError.forbidden(resp, 'You cannot delete the user you are logged in as');
		}
		this.deleteUserFromDb(req.params.userId);
		resp.sendStatus(204);
	}
	
	async createPassword(resp, password) {
		try {
			return await argon2.hash(password, {type: argon2.argon2id});
		}
		catch(err) {
			return appError.internalServerError(resp, 'Hashing password failed', err);
		}
	}
	
	async passwordMatches(resp, password, hash) {
		try {
			return await argon2.verify(hash, password);
		} catch (err) {
			appError.internalServerError(resp, 'Failed to verify password', err);
			return null;
		}
	}

	async getUsersFromDb(){
        let users = [];
        try{
            let cursor = await this.db.queryDatabase('users');
            await cursor.forEach((user) => {
                users.push(user);
            });
        }catch(err){
            console.log(err);
        }
        return users;
    }
	
	async insertUserIntoDb(userObj){
		const db = await this.db.getDb();

		try {
			const collection = db.collection('users');
			let doesUserExist = await collection.findOne({'username' : userObj.username});
			if(doesUserExist) return false; // THE USER ALREADY EXISTS WITH THAT EMAIL
			await collection.insertOne(userObj);
			return true;
		} catch (err){
			console.log(err);
		}
	}

	async getUserFromDb(username) {
		const db = await this.db.getDb();
		let user = null;
		try {
			const collection = db.collection('users');
			user = await collection.findOne({'username': username});
		} catch (err) {
			console.log(err);
		}
		return user;
	}

	async updateUserFromDb(id, updateObj) {
		delete updateObj._id;
		delete updateObj.password;
		const db = await this.db.getDb();
		try {
			const collection = db.collection('users');
			const user = await collection.findOne({'_id': ObjectID(id)});
			if(!user) return false;
			updateObj.password = user.password;
			await collection.updateOne({'_id': ObjectID(id)}, {$set:updateObj});
		} catch(err) {
			console.log(err);
		}
	}

	async deleteUserFromDb(id){
		const db = await this.db.getDb();
		try {
			const collection = db.collection('users');
			collection.deleteOne({'_id': ObjectID(id)});
		} catch (err){
			console.log(err);
		}
	}
}

module.exports = AuthController;