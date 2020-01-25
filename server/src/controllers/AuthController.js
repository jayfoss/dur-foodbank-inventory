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
}

module.exports = AuthController;