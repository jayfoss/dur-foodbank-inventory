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
