class Validator {
	constructor(){
		this.errors = [];
	}
	
	err(resource, field, validator, message){
		this.errors.push({resource:resource, field:field, validator:validator, message:message});
		return false;
	}
	
	isNotNull(id, value, resource){
		if(value === undefined || value === null){
			return this.err(resource, id, {'name':'null'}, resource + ' ' + id + ' must be completed.');
		}
		return true;
	}
	
	isTime(id, value, resource){
		if(isNaN(new Date(value).getUTCMilliseconds())){
			return this.err(resource, id, {'name':'time', 'format':'Y-m-d H:i:s'}, resource + ' ' + id + ' must be a valid time.');
		}
		return true;
	}
	
	isValidLength(id, value, resource, minLength, maxLength){
		if(value.length > maxLength){
			return this.err(resource, id, {'name':'length', 'max':maxLength, 'min':minLength}, resource + ' ' + id + ' must be at most ' + maxLength + ' characters long.');
		}
		else if(value.length < minLength){
			return this.err(resource, id, {'name':'length', 'max':maxLength, 'min':minLength}, resource + ' ' + id + ' must be at least ' + minLength + ' characters long.');
		}
		return true;
	}
	
	isInRange(id, value, resource, min, max){
		if(value > max){
			return this.err(resource, id, {'name':'range', 'max':max, 'min':min}, resource + ' ' + id + ' must be less than or equal to ' + max + '.'});
		}
		else if(value < min){
			return this.err(resource, id, {'name':'range', 'max':max, 'min':min}, resource + ' ' + id + ' must be greater than or equal to ' + min + '.'});
		}
		return true;
	}
	
	hasErrors(){
		return this.errors.length > 0;
	}
}