var users = new Vue({
	el:'#user-data',
	data:{
		users:[
		{userid: 'afser23', permission: 'Manager'},
		{userid: 'chsfdh12', permission: 'Full time'},
		{userid: 'ahasdhf', permission: 'Part time'}
		]
	}
	
})

var warehouse = new Vue({
	el:'#newZone',
	data:{
		zone_name: '',
		bays: 1,
		columns: 4,
		rows: 3,
	}
})