const jwt = require('jsonwebtoken');
const config = require('../../config');
const argon2 = require('argon2');
const AppError = require('../errors/AppError');
const appError = new AppError();

class AuthController {
	constructor(){

	}

	login(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		const user = {};
		resp.cookie('_id', createAuth(user), {expires: new Date(Date.now() + config.auth.maxAge), httpOnly: true, secure: config.auth.secureCookie});
		resp.status(201);
		resp.send(user);
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
			return await argon2.hash(password);
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
}
