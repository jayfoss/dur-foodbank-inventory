class Validator {
	constructor(resource = null){
		this.errors = [];
		this.resource = resource;
	}
	//to add isUniqe?
	err(resource, field, validator, message){
		this.errors.push({resource:resource, field:field, validator:validator, message:message});
		return false;
	}
	
	isNotNull(id, value){
		if(value === undefined || value === null || value ==="" || value ===" "){
			return this.err(this.resource, id, {'name':'null'}, this.resource + ' ' + id + ' must be completed.');
		}
		return true;
	}
	
	isTime(id, value){
		if(value === null) return true;
		if(isNaN(new Date(value).getUTCMilliseconds())){
			return this.err(this.resource, id, {'name':'time', 'format':'Y-m-d H:i:s'}, this.resource + ' ' + id + ' must be a valid time.');
		}
		return true;
	}
	
	isValidLength(id, value, minLength, maxLength){
		if(value === null) return true;
		if(value.length > maxLength){
			return this.err(this.resource, id, {'name':'length', 'max':maxLength, 'min':minLength}, this.resource + ' ' + id + ' must be at most ' + maxLength + ' characters long.');
		}
		else if(value.length < minLength){
			return this.err(this.resource, id, {'name':'length', 'max':maxLength, 'min':minLength}, this.resource + ' ' + id + ' must be at least ' + minLength + ' characters long.');
		}
		return true;
	}
	
	isInRange(id, value, min, max){
		if(value === null) return true;
		if(value > max){
			return this.err(this.resource, id, {'name':'range', 'max':max, 'min':min}, this.resource + ' ' + id + ' must be less than or equal to ' + max + '.');
		}
		else if(value < min){
			return this.err(this.resource, id, {'name':'range', 'max':max, 'min':min}, this.resource + ' ' + id + ' must be greater than or equal to ' + min + '.');
		}
		return true;
	}
	
	isNumber(id, value) {
		if(value === null) return true;
		const num = '' + value;
		if(!(!isNaN(num) && !isNaN(parseFloat(num)))) {
			return this.err(this.resource, id, {'name':'isNumber'}, this.resource + ' ' + id + ' must be a number.');
		}
		return true
	}
	
	isInteger(id, value) {
		if(value === null) return true;
		if(!Number.isInteger(value)) {
			return this.err(this.resource, id, {'name':'isInteger'}, this.resource + ' ' + id + ' must be a whole number.');
		}
		return true;
	}
	
	isBoolean(id, value) {
		if(value === null) return true;
		if (value !== true && value !== false) {
			return this.err(this.resource, id, {'name':'isBoolean'}, this.resource + ' ' + id + ' must be a true or false value.');
		}
		return true;
	}
	
	isYearStartEnd(id, value) {
		
	}
	
	isTimeNN(id, value) {
		return this.isNotNull(id, value) && this.isTime(id, value);
	}
	
	isValidLengthNN(id, value, minLength, maxLength) {
		return this.isNotNull(id, value) && this.isValidLength(id, value, minLength, maxLength);
	}
	
	isInRangeNN(id, value, min, max) {
		return this.isNotNull(id, value) && this.isInRange(id, value, min, max);
	}
	
	isNumberNN(id, value) {
		return this.isNotNull(id, value) && this.isNumber(id, value);
	}
	
	isIntegerNN(id, value) {
		return this.isNotNull(id, value) && this.isInteger(id, value);
	}
	
	isBooleanNN(id, value, min, max) {
		return this.isNotNull(id, value) && this.isBoolean(id, value);
	}
	
	hasErrors() {
		return this.errors.length > 0;
	}
}

module.exports = Validator;