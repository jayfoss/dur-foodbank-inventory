const Model = require('./Model');
const Validator = require('Validator');

class RowModel extends Model {
	constructor() {
		this.fields = this.buildFields([
			'row'
		]);
		this.settableFields = ['row'];
		this.validator = new Validator('Row');
		this.protectedFields = [];
	}
	
	set row(value) {
		if(!this.validator.isIntegerNN('row', value)) {
			return false;
		}
		if(!this.validator.isInRange('row', value, 1, 5)){
			return false;
		}
		this.fields.row = value;
		return this;
	}
}

module.exports = RowModel;