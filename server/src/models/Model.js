const Validator = require('./Validator');

class Model {
	constructor(){
		this.fields = {};
		this.settableFields = [];
		this.validator = new Validator();
		this.protectedFields = [];
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
	
	buildFields(fields) {
		let obj = {};
		fields.forEach(field => {
			obj[field] = null;
			Object.defineProperty(this, field, {
				get: () => {
					return this.fields[field];
				},
				enumerable: true
			});				
		});
		return obj;
	}
	
	booleanify(fields) {
		fields.forEach(field => {
			Object.defineProperty(this, field, {
				set: (value) => {
					if(!this.validator.isBooleanNN(field, value)) return false;
					this.fields[field] = value;
					return this;
				},
				enumerable: true
			});
		});
	}
	
	toJSON() {
		let obj = {};
		Object.keys(this.fields).forEach((key, value) => {
			if(!this.protectedFields.includes(key)){
				obj[key] = value;
			}
		});
		return obj;
	}
}

module.exports = Model;