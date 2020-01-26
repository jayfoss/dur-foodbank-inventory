const jwt = require('jsonwebtoken');
const config = require('../../config');
//const argon2 = require('argon2');
const AppError = require('../errors/AppError');
const appError = new AppError();

class AuthController {
	constructor(){

	}

	login(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		const user = {};
		const pwdMatch = this.passwordMatches(resp, req.body.password, user.field.password);
		if(pwdMatch === null) return;
		if(pwdMatch) {
			resp.cookie('_id', createAuth(user), {expires: new Date(Date.now() + config.auth.maxAge), httpOnly: true, secure: config.auth.secureCookie});
			resp.status(201);
			resp.send(user);
		}
		else {
			return appError.unauthorized(resp, 'Invalid username or password');
		}
	}
	
	logout(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		resp.cookie('_id', false, {expires: -1, httpOnly: true, secure: config.auth.secureCookie}); 
	}
	
	createAuth(user){
		const payload = {
			id:user.id,
			access:user.access
		};
		let token = jwt.sign(payload, config.auth.jwtSecret, {
			expiresIn: config.auth.maxAge
		});
		return token;
	}
	
	async createPassword(resp, password) {
		try {
			//return await argon2.hash(password, {type: argon2.argon2id});
		}
		catch(err) {
			return appError.internalServerError(resp, 'Hashing password failed', err);
		}
	}
	
	async passwordMatches(resp, password, hash) {
		try {
			//return await argon2.verify(hash, password);
		} catch (err) {
			appError.internalServerError(resp, 'Failed to verify password', err);
			return null;
		}
	}

	async insertUser(connection, userObj){
		if(!connection) return;

		try {
			const db = connection.db("foodbank");
			const collection = db.collection("users");
			console.log("1");
			await collection.insertOne(userObj);
		} catch (err){
			console.log(err);
		} finally {
			connection.close();
		}
	}
}

module.exports = AuthController;