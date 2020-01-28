const shelfieURL = 'http://localhost:8080/api/v1';

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
        inventoryZones: [''],
        inventoryBays: [''],
        inventoryShelves: [''],
        inventoryRows: [],
        inventoryColumns: [],
        select_year: '',
        select_month: '',
        stock_taken_date: '',
        select_zone:'',
        select_bay:'',
        select_level:'',
        enter_weight:'',
        tray_category:'',
        tray_position:'',
        selectedTrayColumn:0,
        selectedTrayRow:0,
        inventoryTrays: [],
        inventoryTraysNew: [],
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
        trays: []
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
        inventoryFetchZones: function(){
            axios.get(shelfieURL + '/zones').then((res) => {
                this.inventoryZones = res.data;
            }).catch((err) => {
                this.inventoryZones = [''];
            });
        },
        inventoryFetchBays: function(){
            let zoneName = this.select_zone;
            if(zoneName === '') {
                this.inventoryBays = [''];
                return;
            }
            axios.get(shelfieURL + '/zones/' + zoneName + '/bays').then((res) => {
                this.inventoryBays = res.data.sort();
            }).catch((err) => {
                this.inventoryBays = [''];
            });
        },
        inventoryFetchShelves: function(){
            let zoneName = this.select_zone;
            let bayName = this.select_bay;
            if(zoneName === '' || bayName === '') {
                this.inventoryShelves = [''];
                return;
            }
            axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves').then((res) => {
                console.log(res.data);
                this.inventoryShelves = res.data.sort();
            }).catch((err) => {
                this.inventoryShelves = [''];
            });
        },
        inventoryFetchRowsAndColumns: function(){
            let zoneName = this.select_zone;
            let bayName = this.select_bay;
            let shelfNum = this.select_level;
            axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows').then((res) => {
                this.inventoryRows = res.data.sort();
                console.log("Rows: " + res.data.sort())
                if(this.inventoryRows[0] !== undefined){
                    axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + this.inventoryRows[0] + '/columns').then((res) => {
                        console.log("Columns: " + res.data);
                        this.inventoryColumns = res.data.sort();
                        this.inventoryTrays = [];
                        this.inventoryTraysNew = [];
                        

                        
                        for(let row in this.inventoryRows){
                            for(let column in this.inventoryColumns){
                                let col = this.inventoryColumns[column];
                                let ro = this.inventoryRows[row];
                                axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + ro + '/columns/' + col + '/tray').then((res) => {
                                    let tray = res.data;
                                    tray['row'] = ro;
                                    tray['column'] = col;
                                    this.inventoryTrays.push(tray);
                                });
                            }
                        }
                        console.log(this.inventoryTrays);
                    });
                }
            }).catch((err) => {
                this.inventoryRows = [];
            });
        },
        inventorySetSelectedTray: function(row, col){
            this.selectedTrayColumn = col;
            this.selectedTrayRow = row;
            let tray = {"category": this.tray_category, "weight": this.enter_weight, "expiryYear": {"start": this.select_year, "end": this.select_year}, "expiryMonth": {"start": this.select_month, "end": this.select_month}, "lastUpdated": this.stock_taken_date, "userNote": "", "row": row, "column": col};
            let existingIndex = 0;
            let alreadyExists = false;
            for(let tr in this.inventoryTraysNew){
                let tra = this.inventoryTraysNew[tr];
                if(tra["row"] == row  && tra["column"] == col){
                    alreadyExists = true;
                    existingIndex = tr;
                }
            }

            if(alreadyExists){
                this.inventoryTraysNew[existingIndex] = tray;
            } else {
                this.inventoryTraysNew.push(tray);
            }
            
        },
        inventorySubmitNewTrays: function(){
            let zoneName = this.select_zone;
            let bayName = this.select_bay;
            let shelfNum = this.select_level;
            for(let index in this.inventoryTraysNew){
                let trayToSubmit = this.inventoryTraysNew[index];
                let row = trayToSubmit["row"];
                let column = trayToSubmit["column"];
                delete trayToSubmit["row"];
                delete trayToSubmit["column"];
                axios.patch(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + row + '/columns/' + column + '/tray',
                    trayToSubmit
                );
            }
        },
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
        fetchAllTrays: function(){
            axios.get(shelfieURL + '/trays').then((res) => {
                this.trays = res.data;
            }).catch((err) => {
                this.trays = [];
            });
        },
        sort:function(s) {
            if(s === this.currentSort) {
                this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
            }
            this.currentSort = s;
        },
        nextPage:function() {
            if((this.currentPage*this.pageSize) < this.trays.length-this.skippedRows) this.currentPage++;
        },
        prevPage:function() {
            if(this.currentPage > 1) this.currentPage--;
        }
        /* END OF DATA VIEW PAGE */
    },
    computed:{
        /* INVENTORY */
        
        /* END OF INVENTORY */

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
                if(!object.category || object.weight === undefined || !object.expiryYear || !object.expiryMonth || !object.lastUpdated){
                    this.skippedRows ++;
                    console.log(object)
                    return false;
                }
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

async function login(){
    await fetch(shelfieURL + '/auth', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({
            "email": $("#username-input").val(),
            "password": $("#passwd-input").val()
        })
    }).then((res) => {
        if(res.status === 201){
            shelfieApp.$data.isLoggedIn = true;
        } else {
            shelfieApp.$data.isLoggedIn = false;
        }
    }).catch((err) => {
        shelfieApp.$data.isLoggedIn = false;
    });
}

function fetchZones(){
    fetch(shelfieURL + '/zones').then((res) => {
        return res.json();
    }).then((data) => {
        shelfieApp.$data.inventoryZones = data;
    }).catch((err) => {
        shelfieApp.$data.inventoryZones = [''];
    });
}

async function fetchBays(zoneName) {
    fetch(shelfURL + '/zones/' + zoneName + '/bays').then((res) => {
        return res.json();
    }).then((data) => {
        shelfieApp.$data.inventoryBays = data;
    }).catch((err) => {
        shelfieApp.$data.inventoryBays = [''];
    });
}

shelfieApp.fetchAllTrays();
shelfieApp.inventoryFetchZones();

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