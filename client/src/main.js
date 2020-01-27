const url = 'http://localhost:8080/api/v1';

var shelfieApp = new Vue({
	el: "#shelfie-app",
    data: {
        /* LOGIN */
        isLoggedIn: false,
        /* END OF LOGIN */
        
        /* NAV CONTROL */
		isSidebarActive: false,
		isDataViewActive: false,
		isInventoryActive: true,
		isReportActive: false,
		isWarehouseConfigActive: false,
        isUserManagementActive: false,
        /* END OF NAV CONTROL */

        /* INVENTORY */
        select_year: '',
        select_month: '',
        stock_taken_date: '',
        select_zone:'',
        select_bay:'',
        select_level:'',
        enter_weight:'',
        tray_category:'',
        tray_position:'',
        /* END OF INVENTORY *

        /* DATA VIEW */
        currentSort:'zone',
        currentSortDir:'asc',
        pageSize: 10,
        currentPage: 1,
        skippedRows: 0,
        zoneFilter: "",
        bayFilter: "",
        shelfFilter: "",
        rowFilter: "",
        columnFilter: "",
        categoryFilter: "",
        weightFilter: "",
        trays: 
        /* END OF DATA VIEW */
    },
    methods:{
        /* NAVIGATION CONTROL */
		activatePage: function(page){
            this.isSidebarActive = false;
			this.isDataViewActive = false;
			this.isInventoryActive = false;
			this.isReportActive = false;
			this.isWarehouseConfigActive = false;
			this.isUserManagementActive = false;
			if(page === 'inventory'){
				this.isInventoryActive = true;
			} else if(page === 'viewData') {
				this.isDataViewActive = true;
			} else if(page === 'report'){
				this.isReportActive = true;
			} else if(page === 'warehouseConfig'){
				this.isWarehouseConfigActive = true;
			} else if(page === 'userManagement'){
				this.isUserManagementActive = true;
			}
            console.log(this.isInventoryActive);
        },
        /* END OF NAVIGATION CONTROL */

        /* INVENTORY */
        checkForm: function (e) {
            if (this.select_year && this.select_month &&this.stock_taken_date &&this.select_zone && this.select_bay &&this.select_level && this.enter_weight &&this.food_type) {
                return true;
              }
        
              this.errors = [];
        
              if (!this.select_year) {
                this.errors.push('Expiry Year required.');
              }
              if (!this.select_month) {
                this.errors.push('Expiry Month required.');
              }
              if (!this.stock_taken_date) {
                this.errors.push('Stock taken date required.');
              }
              if (!this.select_zone ) {
                this.errors.push('Zone required.');
              }
              if (!this.select_bay ) {
                this.errors.push('Bay required.');
              }
              if (!this.select_level ) {
                this.errors.push('Level required.');
              }
              if (!this.enter_weight ) {
                this.errors.push('weight required.');
              }
              if (!this.tray_category ) {
                this.errors.push('tray_category required.');
              }
              if (!this.tray_position ) {
                this.errors.push('tray_position required.');
              }
        
            e.preventDefault();
        },
        /* END OF INVENTORY */

        /* DATA VIEW PAGE */
        sort:function(s) {
            if(s === this.currentSort) {
                this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
            }
            this.currentSort = s;
        },
        nextPage:function() {
            if((this.currentPage*this.pageSize) < this.trays.length) this.currentPage++;
        },
        prevPage:function() {
            if(this.currentPage > 1) this.currentPage--;
        },
        fetchAllTrays: async function(){
            return await fetch(url + '/trays');
        }
        /* END OF DATA VIEW PAGE */
    },
    computed:{
        /* DATA VIEW PAGE */
        sortedTrays:function() {
            this.skippedRows = 0;
            console.log(this.currentPage)
            return this.trays.sort((a,b) => {
                let modifier = 1;
                if(this.currentSortDir === 'desc') modifier = -1;
                if(this.currentSort == "expiryYear.start"){
                    if(a["expiryYear"]["start"] < b["expiryYear"]["start"]) return -1 * modifier;
                    if(a["expiryYear"]["start"] > b["expiryYear"]["start"]) return 1 * modifier;
                } else if(this.currentSort == "expiryYear.end"){
                    if(a["expiryYear"]["end"] < b["expiryYear"]["end"]) return -1 * modifier;
                    if(a["expiryYear"]["end"] > b["expiryYear"]["end"]) return 1 * modifier;
                } else if(this.currentSort == "expiryMonth.start"){
                    if(a["expiryMonth"]["start"] < b["expiryMonth"]["start"]) return -1 * modifier;
                    if(a["expiryMonth"]["start"] > b["expiryMonth"]["start"]) return 1 * modifier;
                } else if (this.currentSort == "expiryMonth.end"){
                    if(a["expiryMonth"]["end"] < b["expiryMonth"]["end"]) return -1 * modifier;
                    if(a["expiryMonth"]["end"] > b["expiryMonth"]["end"]) return 1 * modifier;
                } else {
                    if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
                    if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
                }
                
                return 0;
            }).filter((object, index) => {
                let start = (this.currentPage-1)*this.pageSize;
                let end = this.currentPage*this.pageSize;
                let tmpIndex = index - this.skippedRows;
                if(tmpIndex >= start && tmpIndex < end) {
                    if(object.zone.toLowerCase().startsWith(this.zoneFilter.toLowerCase()) &&
                    object.bay.toLowerCase().startsWith(this.bayFilter.toLowerCase()) &&
                    object.shelf.toString().toLowerCase().startsWith(this.shelfFilter.toLowerCase()) &&
                    object.row.toString().toLowerCase().startsWith(this.rowFilter.toLowerCase()) &&
                    object.column.toString().toLowerCase().startsWith(this.columnFilter.toLowerCase()) &&
                    object.category.toLowerCase().startsWith(this.categoryFilter.toLowerCase()) &&
                    object.weight.toString().toLowerCase().startsWith(this.weightFilter.toLowerCase())
                    ){
                        return true;
                    }
                    this.skippedRows++;
                    return false;
                } else {
                    return false;
                }
            });
        }
        /* END OF DATA VIEW PAGE */
    }
});

/* INVENTORY PAGE */
$(function () {
    $('#datetimepicker').datetimepicker({
        format: 'd-m-Y',
        timepicker:false
    });
});

$('#button').click(function(e){
    e.preventDefault();
});
/* END OF INVENTORY PAGE */


/* TRAY TEMPLATE DATA

[
            { "zone": "blue", "bay":"A", "shelf": 1, "row":1, "column":1, "category": "pasta", "weight": 2, "expiryYear" : {"start": 2021, "end":2021}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-07-06", "userNote": "This is a note" },
            { "zone": "yellow", "bay":"C", "shelf": 2, "row":1, "column":2, "category": "beans", "weight": 1.5, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 2, "end": 6}, "lastUpdated": "2020-07-06", "userNote": "This is a note" },
            { "zone": "purple", "bay":"C", "shelf": 3, "row":1, "column":3, "category": "jam", "weight": 0.65, "expiryYear" : {"start": 2023, "end":2023}, "expiryMonth" : {"start": 3, "end": 3}, "lastUpdated": "2020-03-06", "userNote": "This is a note" },
            { "zone": "orange", "bay":"E", "shelf": 4, "row":1, "column":4, "category": "meat", "weight": 1.23, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-01-06", "userNote": "This is a note" },
            { "zone": "blue", "bay":"A", "shelf": 2, "row":1, "column":1, "category": "pasta", "weight": 2, "expiryYear" : {"start": 2021, "end":2021}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-04-01", "userNote": "This is a note" },
            { "zone": "yellow", "bay":"C", "shelf": 5, "row":2, "column":2, "category": "beans", "weight": 1.5, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 2, "end": 6}, "lastUpdated": "2020-09-11", "userNote": "This is a note" },
            { "zone": "purple", "bay":"C", "shelf": 2, "row":4, "column":3, "category": "jam", "weight": 0.65, "expiryYear" : {"start": 2023, "end":2023}, "expiryMonth" : {"start": 3, "end": 3}, "lastUpdated": "2020-12-06", "userNote": "This is a note" },
            { "zone": "orange", "bay":"E", "shelf": 3, "row":3, "column":4, "category": "meat", "weight": 1.23, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-04-23", "userNote": "This is a note" },
            { "zone": "blue", "bay":"A", "shelf": 1, "row":3, "column":1, "category": "pasta", "weight": 2, "expiryYear" : {"start": 2021, "end":2021}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-04-06", "userNote": "This is a note" },
            { "zone": "yellow", "bay":"C", "shelf": 6, "row":1, "column":2, "category": "beans", "weight": 1.5, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 2, "end": 6}, "lastUpdated": "2020-04-06", "userNote": "This is a note" },
            { "zone": "purple", "bay":"C", "shelf": 4, "row":2, "column":3, "category": "jam", "weight": 0.65, "expiryYear" : {"start": 2023, "end":2023}, "expiryMonth" : {"start": 3, "end": 3}, "lastUpdated": "2020-04-06", "userNote": "This is a note" },
            { "zone": "orange", "bay":"E", "shelf": 4, "row":1, "column":4, "category": "meat", "weight": 1.23, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-04-06", "userNote": "This is a note" },
            { "zone": "blue", "bay":"A", "shelf": 3, "row":4, "column":1, "category": "pasta", "weight": 2, "expiryYear" : {"start": 2021, "end":2021}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2020-04-06", "userNote": "This is a note" },
            { "zone": "yellow", "bay":"C", "shelf": 3, "row":3, "column":2, "category": "beans", "weight": 1.5, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 2, "end": 6}, "lastUpdated": "2021-04-06", "userNote": "This is a note" },
            { "zone": "purple", "bay":"C", "shelf": 3, "row":2, "column":3, "category": "jam", "weight": 0.65, "expiryYear" : {"start": 2023, "end":2023}, "expiryMonth" : {"start": 3, "end": 3}, "lastUpdated": "2021-04-06", "userNote": "This is a note" },
            { "zone": "orange", "bay":"E", "shelf": 2, "row":1, "column":4, "category": "meat", "weight": 1.23, "expiryYear" : {"start": 2022, "end":2022}, "expiryMonth" : {"start": 5, "end": 6}, "lastUpdated": "2021-04-06", "userNote": "This is a note" }
        ]

*/