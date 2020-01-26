const Model = require('./Model');
const Validator = require('Validator');

class ShelfModel extends Model {
	constructor() {
		this.fields = this.buildFields([
			'number'
		]);
		this.settableFields = ['number'];
		this.validator = new Validator('Shelf');
		this.protectedFields = [];
		this.rows = [];
	}
	
	set number(value) {
		if(!this.validator.isInRangeNN('number', value, 1, 100)){
			return false;
		}
		this.fields.number = value;
		return this;
	}
}

module.exports = ShelfModel;