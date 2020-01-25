var app = new Vue({
  el: '#test',
  data: {
    message: 'Hello Vue.js!'
  }
})

var addZone = new Vue({
	el:'#newZone',
	data:{
		zone_name: '',
		bays: 1,
		columns:4,
		rows:3
	}
})

var userData = new Vue({
	el:'#user-data',
	data:{
		users:[
		{userid:'abc123', permission:'admin'},
		{userid:'dcs0zz', permission:'part timer'},
		{userid:'abcdefg', permission:'part timer'},
		{userid:'qwerty', permission:'part timer'},
		{userid:'poiuy', permission:'part timer'},
		{userid:'zxcvbn', permission:'part timer'}
		]
	}
})