const Model = require('./Model');
const Validator = require('./Validator');

class TrayModel extends Model {
	constructor() {
		super();
		this.fields = this.buildFields([
			'category',
			'weight',
			'expiryYear',
			'expiryMonth',
			'lastUpdated',
			'userNote'
			
		]);
		this.settableFields = ['category', 'weight', 'expiryYear', 'expiryMonth', 'userNote'];
		this.validator = new Validator('Tray');
		this.protectedFields = [];
	}
	
	set category(value) {
		if(!this.validator.isValidLengthNN('category', value, 1, 25)) {
			return false;
		}
		this.fields.category = value;
		return this;
	}
	
	set weight(value) {
		if(!this.validator.isNumberNN('weight', value)) {
			return false;
		}
		if(!this.validator.isInRange('weight', value, 0, 5)){
			return false;
		}
		this.fields.weight = parseFloat(value);
		return this;
	}
	
	set expiryYear(value) {
		this.fields.expiryYear = value;
	}
	
	set expiryMonth(value) {
		this.fields.expiryMonth = value;
	}
	
	set userNote(value) {
		if(!this.validator.isValidLengthNN('userNote', value, 0, 100)){
			return false;
		}
		this.fields.userNote = value;
		return this;
	}
}

module.exports = TrayModel;
