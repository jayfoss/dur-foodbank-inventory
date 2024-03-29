const jwt = require('jsonwebtoken');
const config = require('../../config');
const argon2 = require('argon2');
const AppError = require('../errors/AppError');
const appError = new AppError();
const UserModel = require('../models/UserModel');

class AuthController {
	constructor(db){
		this.db = db;
	}

	async login(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		let user = await this.getUser(req.body.email);
		if(!user) {
			return appError.unauthorized(resp, 'Invalid email or password');
		}
		const pwdMatch = await this.passwordMatches(resp, req.body.password, user.password);
		if(pwdMatch === null) return;
		if(pwdMatch) {
			user.password = '';
			delete user.password;
			const auth = this.createAuth(user);
			resp.cookie('_id', auth['id'], {expires: new Date(Date.now() + config.auth.maxAge * 1000), httpOnly: true, secure: config.auth.secureCookie});
			resp.cookie('_p', auth['p'], {expires: new Date(Date.now() + config.auth.maxAge * 1000), httpOnly: false, secure: config.auth.secureCookie});
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
			canEditUsers: user.canEditUsers
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
	
	getUsers(req, resp) {
		if(!req.jwtDecoded.canEditUsers) {
			return appError.forbidden(resp, 'You do not have permission to edit users');
		}
	}
	
	createUser(req, resp) {
		if(!req.jwtDecoded.canEditUsers) {
			return appError.forbidden(resp, 'You do not have permission to edit users');
		}
		const user = new UserModel();
		if(!user.map(req.body)) return;
	}
	
	deleteUser(req, resp) {
		if(!req.jwtDecoded.canEditUsers) {
			return appError.forbidden(resp, 'You do not have permission to edit users');
		}
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

	async insertUser(userObj){
		const connection = await this.db.getConnection();

		try {
			const db = connection.db('foodbank');
			const collection = db.collection('users');
			let doesUserExist = await collection.findOne({'email' : userObj['email']});
			if(doesUserExist) return; // THE USER ALREADY EXISTS WITH THAT EMAIL
			await collection.insertOne(userObj);
		} catch (err){
			console.log(err);
		} finally {
			connection.close();
		}
	}

	async getUserFromDb(userEmail) {
		let connection = this.db.getConnection();
		let user = null;
		try {
			const db = connection.db('foodbank');
			const collection = db.collection('users');
			user = await collection.findOne({'email': userEmail});
		} catch (err) {
			console.log(err);
		}
		return user
	}

	async updateUser(userEmail, updateObj) {
		let connection = this.db.getConnection();
		try {
			const db = connection.db('foodbank');
			const collection = db.collection('users');
			console.log(updateObj);
			await collection.updateOne({'email': userEmail}, {$set:updateObj});
		} catch(err) {
			console.log(err);
		}
	}

	async deleteUser(connection, userEmail){
		if(!connection) return;
		try{
			const db = connection.db("foodbank");
			const collection = db.collection("users");
			collection.deleteOne({"email": userEmail});
		} catch (err){
			console.log(err);
		} finally{
			connection.close();
		}
	}
}

module.exports = AuthController;