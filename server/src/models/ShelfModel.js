const Model = require('./Model');
const Validator = require('./Validator');

class ShelfModel extends Model {
	constructor() {
		super();
		this.booleanify(['_shelfOk']);
		this.fields = this.buildFields([
			'_id',
			'_shelfOk'
		]);
		this.settableFields = ['_id', '_shelfOk'];
		this.validator = new Validator('Shelf');
		this.protectedFields = [];
	}
	
	set _id(value) {
		if(!this.validator.isInRangeNN('_id', value, 1, 100)){
			return false;
		}
		this.fields._id = value;
		return this;
	}
}

module.exports = ShelfModel;
