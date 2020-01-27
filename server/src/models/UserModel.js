const Model = require('./Model');
const Validator = require('./Validator');

class UserModel extends Model {
	constructor() {
		this.fields = this.buildFields([
			'_id',
			'email',
			'password',
			'firstName',
			'lastName',
			'canViewData',
			'canEditData',
			'canModifyWarehouse'
		]);
		this.settableFields = ['email', 'firstName', 'lastName', 'canViewData', 'canEditData', 'canModifyWarehouse'];
		this.validator = new Validator('User');
		this.booleanify(['canViewData', 'canEditData', 'canModifyWarehouse']);
		this.protectedFields = ['password'];
	}
	
	set email(value){
		if(!this.validator.isValidLengthNN('email', value, 3, 254)){
			return false;
		}
		if(value.indexOf('@') < 0){
			return this.validator.err('User', 'email', {'name':'format', 'type':'email'}, 'User email address must contain an \'@\' symbol.');
		}
		this.fields.email = value;
		return this;
	}
	
	set firstName(value){
		if(!this.validator.isValidLengthNN('firstName', value, 1, 50)){
			return false;
		}
		this.fields.firstName = value;
		return this;
	}
	
	set lastName(value){
		if(!this.validator.isValidLengthNN('lastName', value, 1, 50)){
			return false;
		}
		this.fields.lastName = value;
		return this;
	}
	
	set password(value) {
		if(!this.validator.isValidLengthNN('password', value, 8, 50)){
			return false;
		}
		this.fields.password = value;
		return this;
	}
}

module.exports = UserModel;