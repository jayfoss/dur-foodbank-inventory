const Model = require('./Model');
const Validator = require('./Validator');

class UserModel extends Model {
	constructor() {
		super();
		this.fields = this.buildFields([
			'_id',
			'username',
			'password',
			'firstName',
			'lastName',
			'canViewData',
			'canEditData',
			'canModifyWarehouse',
			'canEditUsers'
		]);
		this.settableFields = ['username', 'firstName', 'lastName', 'canViewData', 'canEditData', 'canModifyWarehouse', 'canEditUsers'];
		this.validator = new Validator('User');
		//this.booleanify(['canViewData', 'canEditData', 'canModifyWarehouse', 'canEditUsers']);
		this.protectedFields = ['password'];
	}
	
	set username(value){
		if(!this.validator.isValidLengthNN('username', value, 3, 254)){
			return false;
		}
		// if(value.indexOf('@') < 0){
		// 	return this.validator.err('User', 'username', {'name':'format', 'type':'username'}, 'User username address must contain an \'@\' symbol.');
		// }
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
}

module.exports = UserModel;
