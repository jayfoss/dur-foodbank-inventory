const Model = require('./Model');
const Validator = require('./Validator');

class ZoneModel extends Model {
	constructor() {
		super();
		this.fields = this.buildFields([
			'_id',
			'_color'
		]);
		this.settableFields = ['_id', '_color'];
		this.validator = new Validator('Zone');
		this.protectedFields = [];
	}
	
	set _id(value) {
		if(!this.validator.isValidLengthNN('_id', value, 1, 25)){
			return false;
		}
		this.fields.name = value;
		return this;
	}
}

module.exports = ZoneModel;
