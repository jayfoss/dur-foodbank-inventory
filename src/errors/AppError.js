class AppError {
	constructor(){}
	
	sendClientError(resp, code = 400, message = 'A client error has occurred.', data = null){
		if(resp.headersSent) return;
		resp.status(code);
		resp.send({error:message, type:'clientError', data:data});
		return false;
	}
	
	sendValidationError(resp, code = 400, message = 'Invalid data found in request body.', data = null){
		if(resp.headersSent) return;
		resp.status(code);
		resp.send({error:message, type:'validationError', data:data});
	}
	
	sendServerError(resp, error = null, code = 500, message = 'A server error has occurred.'){
		console.error(error);
		if(resp.headersSent) return;
		resp.status(code);
		resp.send({error:message, type:'serverError'});
	}
	
	badRequest(resp, message = 'Bad request', data = null) {
		return this.sendClientError(resp, 400, message, data);
	}
	
	unauthorized(resp, message = 'Unauthorized', data = null) {
		return this.sendClientError(resp, 401, message, data);
	}
	
	forbidden(resp, message = 'Forbidden', data = null) {
		return this.sendClientError(resp, 403, message, data);
	}
	
	unprocessableEntity(resp, message = 'Unprocessable Entity', data = null){
		return this.sendClientError(resp, 422, message, data);
	}
	
	internalServerError(resp, message = 'Internal Server Error', error = null) {
		return this.sendServerError(resp, error, 500, message);
	}
}
module.exports = AppError;