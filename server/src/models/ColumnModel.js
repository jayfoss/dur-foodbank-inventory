const Model = require('./Model');
const Validator = require('Validator');

class ColumnModel extends Model {
	constructor() {
		this.fields = this.buildFields([
			'column'
		]);
		this.settableFields = ['column'];
		this.validator = new Validator('Column');
		this.protectedFields = [];
	}
	
	set column(value) {
		if(!this.validator.isIntegerNN('column', value)) {
			return false;
		}
		if(!this.validator.isInRange('column', value, 1, 5)){
			return false;
		}
		this.fields.column = value;
		return this;
	}
}

module.exports = ColumnModel;