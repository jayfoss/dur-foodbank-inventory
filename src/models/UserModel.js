const Model = require('./Model');
const Validator = require('./Validator');

class UserModel extends Model {
	constructor() {
		super();
		this.booleanify(['canViewData', 'canEditData', 'canModifyWarehouse', 'canModifyUsers']);
		this.fields = this.buildFields([
			'_id',
			'username',
			'password',
			'firstName',
			'lastName',
			'role',
			'canViewData',
			'canEditData',
			'canModifyWarehouse',
			'canModifyUsers'
		]);
		this.settableFields = ['username', 'firstName', 'lastName', 'role', 'canViewData', 'canEditData', 'canModifyWarehouse', 'canModifyUsers'];
		this.validator = new Validator('User');
		this.protectedFields = ['password'];
	}
	
	set username(value){
		if(!this.validator.isValidLengthNN('username', value, 3, 50)){
			return false;
		}
		this.fields.username = value;
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

	set role(value){
		if(!this.validator.isValidLengthNN('role', value, 1, 20)){
			return false;
		}
		this.fields.role = value;
		return this;
	}
}

module.exports = UserModel;
