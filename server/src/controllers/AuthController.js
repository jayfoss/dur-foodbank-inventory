const jwt = require('jsonwebtoken');
const config = require('../../config');

class AuthController {
	constructor(){

	}

	login(req, resp) {
		req.accepts('json');
		resp.set('etag', false);
		const user = {};
		resp.cookie('_id', createAuth(user), {maxAge: config.auth.maxAge, httpOnly: true, secure: config.auth.secureCookie}); 
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
	
	createUser(req, resp) {
		const user = new UserModel();
		if(!user.map(req.body)) return;
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

			let doesUserExist = await collection.findOne({"email" : userObj["email"]});
			if(doesUserExist) return; // THE USER ALREADY EXISTS WITH THAT EMAIL
			await collection.insertOne(userObj);
		} catch (err){
			console.log(err);
		} finally {
			connection.close();
		}
	}

	async getUser(connection, userEmail) {
		if(!connection) return;
		let user = null;
		try {
			const db = connection.db("foodbank");
			const collection = db.collection("users");
			user = await collection.findOne({"email": userEmail});
			
		} catch (err) {
			console.log(err);
		} finally {
			connection.close();
		}
		return user
	}

	async updateUser(connection, userEmail, updateObj) {
		if(!connection) return;
		try {
			const db = connection.db("foodbank");
			const collection = db.collection("users");
			console.log(updateObj);
			await collection.updateOne({"email": userEmail}, {$set:updateObj});
		} catch(err) {

		} finally {
			connection.close();
		}
	}
}

module.exports = AuthController;