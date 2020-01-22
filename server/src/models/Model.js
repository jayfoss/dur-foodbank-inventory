require('Validator.js');

class Model {
	constructor(){
		this.fields = {};
		this.settableFields = [];
		this.validator = new Validator();
	}
	
	/**
		Set all fields to have the values provided in body if they are settable
	*/
	map(body, whitelist = null){
		for(let i in this.settableFields){
			let settableField = this.settableFields[i];
			if(whitelist !== null && !whitelist.includes(settableField)) continue;
			this[settableField] = body[settableField];
		}
		return !this.validator.hasErrors();
	}
}