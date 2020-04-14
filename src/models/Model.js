const Validator = require('./Validator');

class Model {
	constructor(){
		this.fields = {};
		this.settableFields = [];
		this.validator = new Validator();
		this.protectedFields = [];
		//to add uniqueFields?
	}
	
	/**
		Set all fields to have the values provided in body if they are settable
	*/
	map(body, whitelist = null){
		for(let i in this.settableFields){
			let settableField = this.settableFields[i];
			if(whitelist !== null && !whitelist.includes(settableField)) continue;
			this[settableField] = body[settableField];
		};
		for(let i in this.protectedFields){
			let protectedField = this.protectedFields[i];
			if(whitelist != null && !whitelist.includes(protectedField)) continue;
			this[protectedField] = body[protectedField];
		};
		return !this.validator.hasErrors();
	}
	
	update(body, whitelist = null){
		for(let i in this.settableFields){
			let settableField = this.settableFields[i];
			if(whitelist !== null && !whitelist.includes(settableField)) continue;
			if(body[settableField] !== undefined) {
				this[settableField] = body[settableField];
			}
		}
		return !this.validator.hasErrors();
	}
	
	buildFields(fields) {
		let obj = {};
		const self = this;
		fields.forEach(field => {
			obj[field] = null;
			let desc = Object.getOwnPropertyDescriptor(self.__proto__.constructor.prototype, field);
			if(!desc) {
				desc = Object.getOwnPropertyDescriptor(self, field);
			}
			Object.defineProperty(self, field, {
				get: () => {
					return self.fields[field];
				},
				set: desc !== undefined ? desc.set : undefined,
				enumerable: true
			});				
		});
		return obj;
	}
	
	booleanify(fields) {
		fields.forEach(field => {
			Object.defineProperty(this, field, {
				get: () => {
					return this.fields[field];
				},
				set: (value) => {
					if(!this.validator.isBooleanNN(field, value)) return false;
					this.fields[field] = value;
					return this;
				},
				enumerable: true,
				configurable: true
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