const Model = require('./Model');
const Validator = require('Validator');

class ZoneModel extends Model {
	constructor() {
		this.fields = this.buildFields([
			'name'
		]);
		this.settableFields = ['name'];
		this.validator = new Validator('Zone');
		this.protectedFields = [];
		this.bays = [];
	}
	
	set name(value) {
		if(!this.validator.isValidLengthNN('name', value, 1, 25)){
			return false;
		}
		this.fields.name = value;
		return this;
	}
}

module.exports = ZoneModel;