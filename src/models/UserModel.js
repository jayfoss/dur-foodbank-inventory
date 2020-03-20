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
			'canModfiyUsers'
		]);
		this.settableFields = ['username', 'firstName', 'lastName', 'role', 'canViewData', 'canEditData', 'canModifyWarehouse', 'canModifyUsers'];
		this.validator = new Validator('User');
		this.protectedFields = ['password'];
	}
	
	set username(value){
		console.log("USERNAME " + value);
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
		console.log("FIRSTNAME " + value);
		if(!this.validator.isValidLengthNN('firstName', value, 1, 50)){
			return false;
		}
		this.fields.firstName = value;
		return this;
	}
	
	set lastName(value){
		console.log("LASTNAME  " + value);
		if(!this.validator.isValidLengthNN('lastName', value, 1, 50)){
			return false;
		}
		this.fields.lastName = value;
		return this;
	}
	
	set password(value) {
		console.log("PASSWORD " + value); //not called when in protected field
		if(!this.validator.isValidLengthNN('password', value, 8, 50)){
			return false;
		}
		this.fields.password = value;
		return this;
	}

	set role(value){
		console.log("ROLE " + value);
		if(!this.validator.isNotNull("role", value)){
			return false;
		}
		this.fields.role = value;
		return this;
	}
}

module.exports = UserModel;
