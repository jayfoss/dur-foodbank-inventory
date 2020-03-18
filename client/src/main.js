const shelfieURL = 'http://localhost:8080/api/v1';

function getAuthInfo() {
	const cookieStrings = document.cookie.split(';');
	const cookies = {};
	for(let cookie of cookieStrings) {
		const c = cookie.trim().split('=');
		cookies[c[0]] = c[1];
	}
	if(cookies['_p']) {
		const authInfo = JSON.parse(atob(cookies['_p']));
		if(new Date() < authInfo.exp * 1000) {
			return authInfo;
		}
	}
	return false;
}

function getYearColor(y) {
	if(y === NaN) return null;
	if(Number.isInteger((y - 2016) / 4)) return 'exp-cyc-yellow';
	if(Number.isInteger((y - 2017) / 4)) return 'exp-cyc-blue';
	if(Number.isInteger((y - 2018) / 4)) return 'exp-cyc-pink';
	if(Number.isInteger((y - 2019) / 4)) return 'exp-cyc-green';
	return null;
}

function getExpiryFormatState(tray) {
	if(tray === null) return null;
	if(tray.expiryYear === null) return null;
	if(tray.expiryMonth === null) return null;
	if(tray.expiryMonth.start === null && tray.expiryMonth.end === null) {
		if(tray.expiryYear.start === tray.expiryYear.end) {
			return 0;
		}
		return 1;
	}
	else if(tray.expiryMonth.start !== null && tray.expiryMonth.end !== null) {
		if(tray.expiryYear.start === tray.expiryYear.end) {
			if(tray.expiryMonth.start === tray.expiryMonth.end) {
				return 2;
			}
			return 3;
		}
		return 4;
	}
	return null;
}

function getExpirySizeClass(tray) {
	const state = getExpiryFormatState(tray);
	if(state === null) return null;
	switch(state) {
		case 1:
			return 'exp-cyc-ryy';
		case 3:
		case 4:
			return 'exp-cyc-rym';
		default:
			return null;
	}
}

function getExpiryColor(tray) {
	if(tray === null) return null;
	if(tray.expiryYear === undefined) return null;
	if(tray.expiryYear.start === undefined) return null;
	const y = parseInt(tray.expiryYear.start);
	return getYearColor(y);
}

axios.interceptors.response.use((resp) => {
	return resp
}, (err) => {
	if(err.response.data && err.response.data.error) {
		this.makeToast('Error', err.response.data.error, 'danger');
	}
	else {
		this.makeToast('Error', 'A request failed. This may be a connection issue.', 'danger');
	}
	return Promise.reject(err);
});

const shelfieApp = new Vue({
	el: '#shelfie-app',
    data: {
		toastCount: 0,
		loginUsername: null,
		loginPassword: null,

        /* NAV CONTROL */
		isSidebarActive: false,
		isDataViewActive: false,
		isInventoryActive: false,
		isReportActive: false,
		isWarehouseConfigActive: true,
        isUserManagementActive: false,
        /* END OF NAV CONTROL */

        /* WAREHOUSE CONFIG */
        toInsertZoneName: "",
        toInsertBayName: "",
        toInsertNumberOfBays: 0,
        toInsertNumOfShelves: 4,
        toInsertNumOfRows: 3,
        toInsertNumOfColumns: 4,
        warehouseZones: [],
        warehouseBays: [],
        warehouseShelves: [],
        originalData: {"zone":{"name":"", "numberOfBays":-1}, "bay":{"name":"", "numberOfShelves":-1}, "shelf":{"number":-1, "rows":-1, "columns":-1}},
        modifiedData: {"zone":{"name":"", "numberOfBays":-1}, "bay":{"name":"", "numberOfShelves":-1}, "shelf":{"number":-1, "rows":-1, "columns":-1}},
        emptyTray: {'category':'', 'weight': 0.0, 'expiryYear':{'start':null, 'end':null}, 'expiryMonth':{'start':null, 'end':null}, 'lastUpdated':null, 'userNote':''},
        /* END OF WAREHOUSE CONFIG */

        /* INVENTORY */
        inventoryZones: [],
        inventoryBays: [],
        inventoryShelves: [],
        inventoryRows: [],
        inventoryColumns: [],
        select_year: '',
        select_month: '',
        stock_taken_date: '',
        selectedZone: -1,
        selectedBay: -1,
        selectedShelf: -1,
        enter_weight:'',
        tray_category:'',
        tray_position:'',
        shelfTrays: [],
		selectedTray:null,
        inventoryTrays: [],
        inventoryTraysNew: [],
		expandableItemGroups: {'baby':false, 'cleaning':false, 'christmas':false},
        /* END OF INVENTORY *

        /* DATA VIEW */
        currentSort:'zone',
        currentSortDir:'asc',
        pageSize: 10,
        currentPage: 1,
        skippedRows: 0,
        zoneFilter: '',
        bayFilter: '',
        shelfFilter: '',
        rowFilter: '',
        columnFilter: '',
        categoryFilter: '',
        weightFilter: '',
        trays: [],
        /* END OF DATA VIEW */
		
		/* REPORT PAGE */
		isSelected:['red','blue','pink'],
        /* END OF REPORT PAGE */
        
        /* USER MANAGEMENT (UM) */
        UMcurrentSort: 'fName',
        UMcurrentSortDir: 'asc',
        UMusers: ["error: no users loaded"],
        UMcurrentUser: {firstName: "", lastName:"", username:"", role:"", canViewData:false, canEditData:false, canModifyWarehouse:false, canModifyUsers:false, password:""},
        UMroleSelected: ""
    },
    methods:{
		makeToast(title, msg, variant = null) {
			this.toastCount++
			this.$bvToast.toast(msg, {
				  title: title,
				  autoHideDelay: 5000,
				  appendToast: true,
				  variant: variant
			})
		},
		login: function(e) {
			axios.post(shelfieURL + '/auth', {
				email: this.loginUsername,
				password: this.loginPassword
			}).then((res) => {
				this.loginUsername = null;
				this.loginPassword = null;
				this.inventoryFetchZones(true);
			}).catch((err) => {
				if(err.response.data && err.response.data.error) {
					this.makeToast('Error', err.response.data.error, 'danger');
				}
				else {
					this.makeToast('Error', 'Login failed. This may be a connection issue.', 'danger');
				}
			});
			e.preventDefault();
		},
		logout: function() {
			axios.delete(shelfieURL + '/auth').then((res) => {
				this.isSidebarActive = false;
			}).catch((err) => {
				if(err.response.data && err.response.data.error) {
					this.makeToast('Error', err.response.data.error, 'danger');
				}
				else {
					this.makeToast('Error', 'Logout failed. This may be a connection issue.', 'danger');
				}
			});
		},
		isLoggedIn: () => {
            return getAuthInfo() !== false ? true : false;
		},
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
        },
        /* END OF NAVIGATION CONTROL */

        /* WAREHOUSE CONFIG */
        warehouseLimitShelfSelector: function(){
            if(this.toInsertNumOfShelves > 1)
                this.toInsertNumOfShelves--;
        },
        warehouseLimitRowSelector: function(useModifySection){
            if(useModifySection){
                if(this.modifiedData.shelf.rows > 1)
                    this.modifiedData.shelf.rows--;
            } else {
                if(this.toInsertNumOfRows > 1)
                    this.toInsertNumOfRows--;
            }
        },
        warehouseLimitColumnSelector: function(useModifySection){
            if(useModifySection){
                if(this.modifiedData.shelf.columns > 1)
                    this.modifiedData.shelf.columns--;
            } else {
                if(this.toInsertNumOfColumns > 1)
                    this.toInsertNumOfColumns--;
            }
        },
        warehouseChangeNumberOfBaysInsert: function(offset){
            this.toInsertNumberOfBays += offset;
            if (this.toInsertNumberOfBays < 0)
                this.toInsertNumberOfBays = 0;
            else if(this.toInsertNumberOfBays > 26)
                this.toInsertNumberOfBays = 26;
        },
        warehouseModifySubmit: function(){
            // SHELF FUNCTIONALITY
            if(this.modifiedData.shelf.columns != this.originalData.shelf.columns){
                if(this.modifiedData.shelf.columns < this.originalData.shelf.columns){
                    // DELETE SOME COLUMNS
                    for(let row = 1; row <= this.originalData.shelf.rows; row++){
                        axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + this.originalData.shelf.number + '/rows/' + row + '/columns/deletemany/' + this.modifiedData.shelf.columns, {
                            withCredentials: true
                        });
                    }
                } else{
                    // ADD SOME COLUMNS
                    for(let row = 1; row <= this.originalData.shelf.rows; row++){
                        axios.post(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + this.originalData.shelf.number + '/rows/' + row + '/columns/insertmany/' + this.modifiedData.shelf.columns, {
                            withCredentials: true
                        });
                    }
                }
            }

            if(this.modifiedData.shelf.rows != this.originalData.shelf.rows){
                if(this.modifiedData.shelf.rows < this.originalData.shelf.rows){
                    // DELETE SOME ROWS
                    axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + this.originalData.shelf.number + '/rows/deletemany/' + this.modifiedData.shelf.rows, {
                        withCredentials: true
                    });
                } else {
                    // ADD SOME ROWS
                    axios.post(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + this.originalData.shelf.number + '/rows/insertmany/' + this.modifiedData.shelf.rows, {
                        withCredentials: true
                    });
                }
            }

            // BAY FUNCTIONALITY
            if(this.modifiedData.bay.name != this.originalData.bay.name){
                // RENAME BAY
                axios.patch(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name, {
                    'name': this.modifiedData.bay.name,
                    withCredentials: true
                });
            }

            if(this.modifiedData.bay.numberOfShelves != this.originalData.bay.numberOfShelves){
                if(this.modifiedData.bay.numberOfShelves < this.originalData.bay.numberOfShelves){
                    // DELETE SOME SHELVES
                    axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/deletemany/' + this.modifiedData.bay.numberOfShelves, {
                        withCredentials: true
                    });
                } else {
                    // ADD SOME SHELVES
                    axios.post(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/insertmany/' + this.modifiedData.bay.numberOfShelves, {
                        withCredentials: true
                    });
                }
            }
            
            // ZONE FUNCTIONALITY
            if(this.modifiedData.zone.numberOfBays != this.originalData.zone.numberOfBays){
                if(this.modifiedData.zone.numberOfBays < this.originalData.zone.numberOfBays){
                    // DELETE SOME BAYS
                    axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/deletemany/' + this.modifiedData.zone.numberOfBays, {
                        withCredentials: true
                    });
                } else {
                    // ADD SOME BAYS
                    axios.post(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/insertmany/' + this.modifiedData.zone.numberOfBays, {
                        withCredentials: true
                    });
                }
            }

            if(this.modifiedData.zone.name != this.originalData.zone.name){
                // RENAME ZONE
                axios.patch(shelfieURL + '/zones/' + this.originalData.zone.name, {
                    'name': this.modifiedData.zone.name,
                    withCredentials: true
                });
            }

            // RELOAD THE PAGE HERE
            
        },
        warehouseDeleteZone: function(){
            if(confirm('Are you sure you want to delete the zone ' + this.originalData.zone.name + '?\nThis action is irreversible.'))
                axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name, {
                    withCredentials: true
                });
                // RELOAD PAGE HERE
        },
        warehouseDeleteBay: function(){
            if(confirm('Are you sure you want to delete bay ' + this.originalData.bay.name + ' from zone ' + this.originalData.zone.name + '?\nThis action is irreversible.'))
                axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name, {
                    withCredentials: true
                });
                // RELOAD PAGE HERE
        },
        warehouseDeleteShelf: function(){
            if(confirm('Are you sure you want to delete shelf ' + this.originalData.shelf.number + ' from bay ' + this.originalData.bay.name + ' in zone ' + this.originalData.zone.name + '?\nThis action is irreversible.'))
                axios.delete(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + this.originalData.shelf.number, {
                    withCredentials: true
                });
                // RELOAD PAGE HERE
        },
        warehouseCreateSubmit: function(){
            if(this.toInsertZoneName == '')
                return;

            if(this.toInsertNumberOfBays > 0){
                axios.post(shelfieURL + '/zones/', {
                    name: this.toInsertZoneName,
                    bays: this.toInsertNumberOfBays,
                    shelves: this.toInsertNumOfShelves,
                    rows: this.toInsertNumOfRows,
                    columns: this.toInsertNumOfColumns,
                    withCredentials: true
                });
            } else if(this.toInsertBayName != ''){
                axios.post(shelfieURL + '/zones/', {
                    name: this.toInsertZoneName,
                    bays: this.toInsertBayName,
                    shelves: this.toInsertNumOfShelves,
                    rows: this.toInsertNumOfRows,
                    columns: this.toInsertNumOfColumns,
                    withCredentials: true
                });
            }

            
        },
        warehouseFetchZones: function(){
            this.warehouseZones = [];
            this.warehouseBays = [];
            this.warehouseShelves = [];
            this.originalData.zone.name = this.modifiedData.zone.name = "";
            this.originalData.bay.name = this.modifiedData.bay.name = "";
            this.originalData.shelf.number = this.modifiedData.shelf.number = -1;
            this.originalData.shelf.rows = this.modifiedData.shelf.rows = -1;
            this.originalData.shelf.columns = this.modifiedData.shelf.columns = -1;
            
            axios.get(shelfieURL + '/zones', {withCredentials: true}).then((res) => {
                this.warehouseZones = res.data;
            }).catch((err) => {
                this.warehouseZones = [];
            });
        },
        warehouseFetchBays: function(zoneName){
            this.originalData.zone.name = this.modifiedData.zone.name = zoneName;
            this.warehouseBays = [];
            this.warehouseShelves = [];
            this.originalData.bay.name = this.modifiedData.bay.name = "";
            this.originalData.shelf.number = this.modifiedData.shelf.number = -1;
            this.originalData.shelf.rows = this.modifiedData.shelf.rows = -1;
            this.originalData.shelf.columns = this.modifiedData.shelf.columns = -1;

            axios.get(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays', {withCredentials: true}).then((res) => {
                this.warehouseBays = res.data;
                this.originalData.zone.numberOfBays = this.modifiedData.zone.numberOfBays = this.warehouseBays.length;
            }).catch((err) => {
                this.warehouseBays = [];
                this.originalData.zone.numberOfBays = this.modifiedData.zone.numberOfBays = 0;
            });
            
        },
        warehouseFetchShelves: function(bayName){
            this.originalData.bay.name = this.modifiedData.bay.name = bayName;
            this.warehouseShelves = [];
            this.originalData.shelf.number = this.modifiedData.shelf.number = -1;
            this.originalData.shelf.rows = this.modifiedData.shelf.rows = -1;
            this.originalData.shelf.columns = this.modifiedData.shelf.columns = -1;

            axios.get(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves', {withCredentials: true}).then((res) => {
                this.warehouseShelves = res.data;
                this.originalData.bay.numberOfShelves = this.modifiedData.bay.numberOfShelves = this.warehouseShelves.length;
            }).catch((err) => {
                this.warehouseShelves = [];
                this.originalData.bay.numberOfShelves = this.modifiedData.bay.numberOfShelves = 0;
            });

        },
        warehouseFetchRowsColumns(shelfNumber){
            this.originalData.shelf.number = this.modifiedData.shelf.number = shelfNumber;
            this.originalData.shelf.rows = this.modifiedData.shelf.rows = -1;
            this.originalData.shelf.columns = this.modifiedData.shelf.columns = -1;
            axios.get(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + shelfNumber + '/rows', {withCredentials: true}).then((res) => {
                let rows = res.data.length;
                this.originalData.shelf.rows = this.modifiedData.shelf.rows = rows;

                axios.get(shelfieURL + '/zones/' + this.originalData.zone.name + '/bays/' + this.originalData.bay.name + '/shelves/' + shelfNumber + '/rows/1/columns', {withCredentials: true}).then((res) => {
                    let columns = res.data.length;
                    this.originalData.shelf.columns = this.modifiedData.shelf.columns = columns;
                }).catch((err) => {
                    this.originalData.shelf.columns = this.modifiedData.shelf.columns = 0;
                });
                
                
            }).catch((err) => {
                this.originalData.shelf.rows = this.modifiedData.shelf.rows = 0;
                this.originalData.shelf.columns = this.modifiedData.shelf.columns = 0;
            });
        },
        warehouseChangeNumberOfBays: function(offset){
            this.modifiedData.zone.numberOfBays += offset
            if(this.modifiedData.zone.numberOfBays < 1)
                this.modifiedData.zone.numberOfBays = 1
        },
        warehouseChangeNumberOfShelves: function(offset){
            this.modifiedData.bay.numberOfShelves += offset
            if(this.modifiedData.bay.numberOfShelves < 1)
                this.modifiedData.bay.numberOfShelves = 1
        },
        /* END OF WAREHOUSE CONFIG */

        /* INVENTORY */
        inventoryFetchZones: function(selectFirst=false){
            axios.get(shelfieURL + '/zones', {withCredentials: true}).then((res) => {
                this.inventoryZones = res.data;
				if(this.inventoryZones.length > 0 && selectFirst) this.selectedZone = 0;
            }).catch((err) => {
                this.inventoryZones = [];
            });
        },
        inventoryFetchBays: function(selectFirst=false){
            if(this.selectedZone === -1) {
                this.inventoryBays = [];
                return;
            }
            axios.get(shelfieURL + '/zones/' + this.inventoryZones[this.selectedZone] + '/bays', {withCredentials: true}).then((res) => {
                this.inventoryBays = res.data.sort();
				if(this.inventoryBays.length > 0 && selectFirst) this.selectedBay = 0;
            }).catch((err) => {
                this.inventoryBays = [];
            });
        },
        inventoryFetchShelves: function(selectFirst=false){
            if(this.selectedZone === -1 || this.selectedBay === -1) {
                this.inventoryShelves = [];
                return;
            }
            axios.get(shelfieURL + '/zones/' + this.inventoryZones[this.selectedZone] + '/bays/' + this.inventoryBays[this.selectedBay] + '/shelves', {withCredentials: true}).then((res) => {
                this.inventoryShelves = res.data.sort();
				if(this.inventoryShelves.length > 0 && selectFirst) this.selectedShelf = 0;
            }).catch((err) => {
                this.inventoryShelves = [];
            });
        },
		inventoryFetchShelfTrays: function() {
			axios.get(shelfieURL + '/zones/' + this.inventoryZones[this.selectedZone] + '/bays/' + this.inventoryBays[this.selectedBay] + '/shelves/' + this.inventoryShelves[this.selectedShelf]._id + '/trays', {withCredentials: true}).then((res) => {
                this.shelfTrays = res.data;
            }).catch((err) => {
                this.shelfTrays = [];
            });
		},
        inventoryFetchRowsAndColumns: function(){
            let zoneName = this.select_zone;
            let bayName = this.select_bay;
            let shelfNum = this.select_shelf;
            axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows', {withCredentials: true}).then((res) => {
                this.inventoryRows = res.data.sort();
                console.log('Rows: ' + res.data.sort())
                if(this.inventoryRows[0] !== undefined){
                    axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + this.inventoryRows[0] + '/columns', {withCredentials: true}).then((res) => {
                        console.log('Columns: ' + res.data);
                        this.inventoryColumns = res.data.sort();
                        this.inventoryTrays = [];
                        this.inventoryTraysNew = [];
                        

                        
                        for(let row in this.inventoryRows){
                            for(let column in this.inventoryColumns){
                                let col = this.inventoryColumns[column];
                                let ro = this.inventoryRows[row];
                                axios.get(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + ro + '/columns/' + col + '/tray', {withCredentials: true}).then((res) => {
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
            let tray = {'category': this.tray_category, 'weight': this.enter_weight, 'expiryYear': {'start': this.select_year, 'end': this.select_year}, 'expiryMonth': {'start': this.select_month, 'end': this.select_month}, 'lastUpdated': this.stock_taken_date, 'userNote': '', 'row': row, 'column': col};
            let existingIndex = 0;
            let alreadyExists = false;
            for(let tr in this.inventoryTraysNew){
                let tra = this.inventoryTraysNew[tr];
                if(tra['row'] === row  && tra['column'] === col){
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
            let shelfNum = this.select_shelf;
            for(let index in this.inventoryTraysNew){
                let trayToSubmit = this.inventoryTraysNew[index];
                let row = trayToSubmit['row'];
                let column = trayToSubmit['column'];
                delete trayToSubmit['row'];
                delete trayToSubmit['column'];
                axios.patch(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + row + '/columns/' + column + '/tray',
                    trayToSubmit, {withCredentials: true}
                );
            }
        },
        checkForm: function (e) {
            if (this.select_year && this.select_month &&this.stock_taken_date &&this.select_zone && this.select_bay &&this.select_shelf && this.enter_weight &&this.food_type) {
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
              if (!this.select_shelf ) {
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
		getYearColor: (y) => {
			return getYearColor(y);
		},
		trayContent: function(str) {
			if(this.selectedTray === null || this.selectedTray === undefined) return;
			this.selectedTray.category = str;
		},
		trayExpiry: function(yearRange, monthRange) {
			if(this.selectedTray === null || this.selectedTray === undefined) return;
			this.selectedTray.expiryYear = yearRange;
			if(monthRange !== undefined) {
				this.selectedTray.expiryMonth = monthRange;
			}
			else {
				this.selectedTray.expiryMonth = {start: null, end: null};
			}
			this.nextTray();
		},
		getExpiryString: (tray) => {
			const state = getExpiryFormatState(tray);
			if(state === null) return null;
			switch(state) {
				case 0:
					return tray.expiryYear.start;
				case 1:
					return tray.expiryYear.start + '-' + tray.expiryYear.end;
				case 2:
					return luxon.DateTime.fromObject({month: tray.expiryMonth.start}).toFormat('MMM') + ' ' + tray.expiryYear.start;
				case 3:
					return luxon.DateTime.fromObject({month: tray.expiryMonth.start}).toFormat('MMM') + '-' + luxon.DateTime.fromObject({month: tray.expiryMonth.end}).toFormat('MMM') + ' ' + tray.expiryYear.start;
				case 4:
					return luxon.DateTime.fromObject({month: tray.expiryMonth.start}).toFormat('MMM') + ' ' + tray.expiryYear.end + '-' + luxon.DateTime.fromObject({month: tray.expiryMonth.end}).toFormat('MMM') + ' ' + tray.expiryYear.end;
				default:
					return null;
			}
		},
		getExpiryClass: (tray) => {
			return getExpirySizeClass(tray) + ' ' + getExpiryColor(tray);
		},
		sectionSelect: function(section, forward) {
			let s = null;
			let t = null
			if(section === 'zone') {
				s = 'inventoryZones';
				t = 'selectedZone';
			}
			if(section === 'bay') {
				s = 'inventoryBays';
				t = 'selectedBay';
			}
			if(section === 'shelf') {
				s = 'inventoryShelves';
				t = 'selectedShelf';
			}
			if(s === null) return;
			let i = this[t];
			if(forward) i++;
			else i--;
			this[t] = (i % this[s].length + this[s].length) % this[s].length;
		},
		fillShelf: function() {
			if(this.selectedTray === null) { 
				this.makeToast('Error', 'No tray selected.', 'danger');
				return;
			}
			for(let row of this.shelfTrays) {
				for(let tray of row) {
					tray.category = this.selectedTray.category;
					tray.weight = this.selectedTray.weight;
					tray.expiryYear = {start: this.selectedTray.expiryYear.start, end: this.selectedTray.expiryYear.end};
					tray.expiryMonth = {start: this.selectedTray.expiryMonth.start, end: this.selectedTray.expiryMonth.end};
					tray.userNote = this.selectedTray.userNote;
				}
			}
		},
		clearTray: function() {
			if(this.selectedTray === null){
				this.makeToast('Error', 'No tray selected.', 'danger');
				return;
			}
			this.selectedTray.category = '';
			this.selectedTray.weight = 0;
			this.selectedTray.expiryYear = {start: null, end: null};
			this.selectedTray.expiryMonth = {start: null, end: null};
			this.selectedTray.userNote = '';
		},
		shelfOk: function() {
			if(!this.inventoryShelves[this.selectedShelf]) return;
			axios.patch(shelfieURL + '/zones/' + this.inventoryZones[this.selectedZone] + '/bays/' + this.inventoryBays[this.selectedBay] + '/shelves/' + this.inventoryShelves[this.selectedShelf]._id, 
				{_shelfOk: true},
				{withCredentials: true})
			.then((res) => {
				this.inventoryShelves[this.selectedShelf]._shelfOk = true;
                this.makeToast('Success', 'Shelf marked OK', 'success');
            });
		},
		isShelfOk: function(shelf) {
			if(!shelf) return false;
			return shelf._shelfOk;
		},
		isShelfSelected: function(shelf) {
			if(!shelf) return false;
			return shelf === this.inventoryShelves[this.selectedShelf];
		},
		nextTray: function() {
			const tray = this.selectedTray;
			if(!tray) return;
			if(tray.col - 1 < this.shelfTrays[tray.row - 1].length - 1) {
				this.selectedTray = this.shelfTrays[tray.row - 1][tray.col];
			}
			else if(tray.col - 1 === this.shelfTrays[tray.row - 1].length - 1 && tray.row - 1 < this.shelfTrays.length - 1) {
				this.selectedTray = this.shelfTrays[tray.row][0];
			}
			else {
				this.selectedTray = this.shelfTrays[0][0];
			}
		},
		viewNote: function() {
			if(this.selectedTray === null) {
				this.makeToast('Error', 'No tray selected.', 'danger');
				return;
			}
			this.$bvModal.show('note-modal');
		},
        /* END OF INVENTORY */

        /* DATA VIEW PAGE */
        fetchAllTrays: function(){
            axios.get(shelfieURL + '/trays', {withCredentials: true}).then((res) => {
                this.trays = res.data;
            }).catch((err) => {
                this.trays = [];
            });
        },
        sort: function(s) {
            if(s === this.currentSort) {
                this.currentSortDir = this.currentSortDir==='asc'?'desc':'asc';
            }
            this.currentSort = s;
        },
        nextPage: function() {
            if((this.currentPage*this.pageSize) < this.trays.length-this.skippedRows) this.currentPage++;
        },
        prevPage: function() {
            if(this.currentPage > 1) this.currentPage--;
        },


        /* END OF DATA VIEW PAGE */
        
		/* REPORT PAGE TESTING */
		myFilter:function(reportzone) {
			/*this.isSelected = !this.isSelected;*/
			if(this.isSelected.includes(reportzone)){
					const indextest = this.isSelected.indexOf(reportzone);
					this.isSelected.splice(indextest,1);
			}
			else{
				this.isSelected.push(reportzone);
			}
		},
        /* END OF REPORT PAGE TESTING */
        
        /* USER MANAGEMENT */
        addRows: function(){        //doesn't work and I don't know why
            var uTable;
            var data;
            var row;
            this.UMUsers = this.fetchAllUsers;
            uTable = document.getElementById("userTableBody");
            for (i=0; i < this.UMUsers.length; i++){
                data = this.UMUsers[i];
                row = $('<tr><td>ahhhtesettttt</td><td>test1</td></tr>');
                //document.getElementById("userTableBody").append(row);
                uTable.append($('<tr><td>ahhh</td><td>ahhh</td></tr>'));
            }
        },

        emptyFields: function(){
            this.UMcurrentUser = {firstName: "", lastName:"", username:"", role:"", canViewData:false, canEditData:false, canModifyWarehouse:false, canModifyUsers:false};
            //document.getElementById("userTable").rows.classList.remove("tableSelected");
            document.getElementById("passwordContainer").style.visibility = 'visible';
            document.getElementById("updateRecordButton").style.visibility = 'hidden';   
            document.getElementById("addUserButton").style.visibility = 'visible';
            $('#userTable tr').removeClass("tableSelected");
            //deselect current user from table...
            this.populateFields();
        },

        resetRoleButtons: function(){
            document.getElementById("managerButton").classList.remove("role-button-selected");
            document.getElementById("teamleaderButton").classList.remove("role-button-selected");
            document.getElementById("stockmoverButton").classList.remove("role-button-selected");
            document.getElementById("sortingvolunteerButton").classList.remove("role-button-selected");
        },

        updatePermissionChecks: function(){
            document.getElementById("viewdataCheck").checked = this.UMcurrentUser["canViewData"];
            document.getElementById("editdataCheck").checked = this.UMcurrentUser["canEditData"];
            document.getElementById("modifywarehouseCheck").checked = this.UMcurrentUser["canModifyWarehouse"];
            document.getElementById("modifyusersCheck").checked = this.UMcurrentUser["canModifyUsers"];
        },

        editUser: function(){
            document.getElementById("passwordContainer").style.visibility = 'hidden';   
            document.getElementById("updateRecordButton").style.visibility = 'visible';   
            document.getElementById("addUserButton").style.visibility = 'hidden';
            this.populateFields();
        },

        populateFields: function(){
            //make it visible
            //IF ADDING USER, HAVE A BOOL SAYING SO AND EMPTY UMCURRENTUSER
            var currentRole;
            console.log(this.UMcurrentUser);

            document.getElementById("userFields").style.visibility='visible';
            document.getElementById("userFieldsTitle").style.visibility='visible';

            document.getElementById("fNameInput").value = this.UMcurrentUser["firstName"];
            document.getElementById("fNameInput").visible = false;
            document.getElementById("lNameInput").value = this.UMcurrentUser["lastName"];
            document.getElementById("uNameInput").value = this.UMcurrentUser["username"];
            
            this.resetRoleButtons();
            console.log("roles reset, current role");
            console.log(this.UMcurrentUser["role"]);
            currentRole = this.UMcurrentUser["role"].toLocaleLowerCase();
            if (currentRole == "manager"){
                document.getElementById("managerButton").classList.add("role-button-selected");
                //document.getElementById("managerButton").siblings().removeClass('role-button-selected'); NOT WORKING
            }
            else if (currentRole == "team leader"){
                document.getElementById("teamleaderButton").classList.add("role-button-selected");
            }
            else if (currentRole == "stock mover"){
                document.getElementById("stockmoverButton").classList.add("role-button-selected");
            }
            else if (currentRole == "sorting volunteer"){
                document.getElementById("sortingvolunteerButton").classList.add("role-button-selected");
            }

            this.updatePermissionChecks();
            //console.log(this.UMcurrentUser["canEditData"]);
            //document.getElementById("managerButton").addClass("role-button-selected");  //to add dynamability
            //to convert the strings to bool before thingy
        },

        managerSelected: function(){
            this.resetRoleButtons();
            document.getElementById("managerButton").classList.add("role-button-selected");

            this.UMcurrentUser["canViewData"] = true;
            this.UMcurrentUser["canEditData"] = true;
            this.UMcurrentUser["canModifyWarehouse"] = true;
            this.UMcurrentUser["canModifyUsers"] = true;

            this.updatePermissionChecks();

            this.UMroleSelected = "Manager";
        },

        teamleaderSelected: function(){
            this.resetRoleButtons();
            document.getElementById("teamleaderButton").classList.add("role-button-selected");

            this.UMcurrentUser["canViewData"] = true;
            this.UMcurrentUser["canEditData"] = true;
            this.UMcurrentUser["canModifyWarehouse"] = false;
            this.UMcurrentUser["canModifyUsers"] = false;

            this.updatePermissionChecks();

            this.UMroleSelected = "Team Leader";
        },

        stockmoverSelected: function(){
            this.resetRoleButtons();
            document.getElementById("stockmoverButton").classList.add("role-button-selected");

            this.UMcurrentUser["canViewData"] = true;
            this.UMcurrentUser["canEditData"] = true;
            this.UMcurrentUser["canModifyWarehouse"] = false;
            this.UMcurrentUser["canModifyUsers"] = false;

            this.updatePermissionChecks();

            this.UMroleSelected = "Stock Mover";
        },

        sortingvolunteerSelected: function(){
            this.resetRoleButtons();
            document.getElementById("sortingvolunteerButton").classList.add("role-button-selected");

            this.UMcurrentUser["canViewData"] = true;
            this.UMcurrentUser["canEditData"] = false;
            this.UMcurrentUser["canModifyWarehouse"] = false;
            this.UMcurrentUser["canModifyUsers"] = false;

            this.updatePermissionChecks();

            this.UMroleSelected = "Sorting Volunteer";
        },

        updateCurrentUser: function(){
            this.UMcurrentUser["firstName"] = document.getElementById("fNameInput").value;
            this.UMcurrentUser["lastName"] = document.getElementById("lNameInput").value;
            this.UMcurrentUser["username"] = document.getElementById("uNameInput").value;
            this.UMcurrentUser["password"] = document.getElementById("passwordInput").value;
            this.UMcurrentUser["role"] = this.UMroleSelected;       //needs to be reset at the end of function
            //role values will already be in the dictionary
        },

        submitUser: function(){
            this.updateCurrentUser();
            //role values will already be in the dictionary

            console.log(this.UMcurrentUser);
            console.log(this.UMroleSelected);
            //axios.patch(shelfieURL + '/zones/' + zoneName + '/bays/' + bayName + '/shelves/' + shelfNum + '/rows/' + row + '/columns/' + column + '/tray', trayToSubmit, {withCredentials: true}
            axios.post(shelfieURL + '/users1', this.UMcurrentUser, {withCredentials: true}).then((res) => this.UMcurrentUser["role"] = "");


            //this.UMcurrentUser["role"] = "";
        },

        updateUser: function(){
            this.updateCurrentUser();

            axios.patch(shelfieURL + '/users1', this.UMcurrentUser, {withCredentials: true}).then((res) => this.UMcurrentUser["role"] = "");
        }


    },
    computed:{
        /* INVENTORY */
		noteModel: {
			get: function() {
				if(this.selectedTray !== null) {
					return this.selectedTray.userNote;
				}
				let note = '';
				return note;
			},
			set: function(value) {
				if(this.selectedTray !== null) {
					this.selectedTray.userNote = value;
					return;
				}
				this.makeToast('Error', 'Could not update note. No tray selected. How did we get here?', 'danger');
			}
			
		},
        monthYearButtons: function() {
			const start = luxon.DateTime.local().minus({months: 1});
			const end = luxon.DateTime.local().plus({months: 11});
			const yearMonths = [];
			let current = start;
			while(current < end) {
				const c = current.toObject();
				const ym = {y: {start: c.year, end: c.year}, m: {start: c.month, end: c.month}, mt: current.toFormat('MMM').toUpperCase()};
				yearMonths.push(ym);
				current = current.plus({months: 1});
			}
			return yearMonths;
		},
		yearButtons: function() {
			const start = luxon.DateTime.local();
			const end = luxon.DateTime.local().plus({years: 3});
			const years = [];
			let current = start;
			while(current < end) {
				years.push(current.toObject().year);
				current = current.plus({years: 1});
			}
			return years;
		},
		quarterButtons: function() {
			const start = luxon.DateTime.local().startOf('quarter').minus({months: 3});
			const end = luxon.DateTime.local().plus({months: 12});
			const quarters = [];
			let current = start;
			while(current < end) {
				const c = current.toObject();
				const p = current.plus({months: 2});
				quarters.push({y: {start: c.year, end: c.year}, m: {start: c.month, end: p.toObject().month}, mt: {start: current.toFormat('MMM').toUpperCase(), end: p.toFormat('MMM').toUpperCase()}});
				current = current.plus({months: 3});
			}
			return quarters;
		},
        /* END OF INVENTORY */

        /* USER MANAGEMENT PAGE     remember UMusers, UMcurrentSort, UMcurrentSortDir*/
        fetchAllUsers: function(){
            // var uTable;
            // var data;
            // var row;
            axios.get(shelfieURL + '/users1', {withCredentials: true}).then((res) => {
                this.UMusers = res.data;
            }).catch((err) => {
                this.UMusers = ["error retrieving data"];
            });
            // uTable = document.getElementById("userTable");
            // for (i = 0; i<this.UMusers.length; i++){
            //     data = this.UMusers[i];
            //     row = $('<tr><td>ahhhtesettttt</td></tr>');
            //     uTable.append(row);
            // }
            return this.UMusers;
        },

        sortedUsers: function(){
            //to sort later
            this.UMUsers = this.fetchAllUsers;
            return this.UMusers //to populate later
        },
        // addRows: function(){
        //     var uTable;
        //     var data;
        //     var row;
        //     this.UMUsers = this.fetchAllUsers;
        //     uTable = document.getElementById("userTable");
        //     for (i=0; i < this.UMUsers.length; i++){
        //         data = this.UMUsers[i]
        //         row = $('<tr><td>ahhhtesettttt</td></tr>');
        //         uTable.append(row);
        //     }
        // },

        //can borrow sort functions from data view?


        /* END OF USER MANAGEMENT PAGE */

        /* DATA VIEW PAGE */
        sortedTrays:function() {
            this.skippedRows = 0;
            console.log(this.currentPage)
            return this.trays.sort((a,b) => {
                let modifier = 1;
                if(this.currentSortDir === 'desc') modifier = -1;
                if(this.currentSort == 'expiryYear.start'){
                    if(a['expiryYear']['start'] < b['expiryYear']['start']) return -1 * modifier;
                    if(a['expiryYear']['start'] > b['expiryYear']['start']) return 1 * modifier;
                } else if(this.currentSort == 'expiryYear.end'){
                    if(a['expiryYear']['end'] < b['expiryYear']['end']) return -1 * modifier;
                    if(a['expiryYear']['end'] > b['expiryYear']['end']) return 1 * modifier;
                } else if(this.currentSort == 'expiryMonth.start'){
                    if(a['expiryMonth']['start'] < b['expiryMonth']['start']) return -1 * modifier;
                    if(a['expiryMonth']['start'] > b['expiryMonth']['start']) return 1 * modifier;
                } else if (this.currentSort == 'expiryMonth.end'){
                    if(a['expiryMonth']['end'] < b['expiryMonth']['end']) return -1 * modifier;
                    if(a['expiryMonth']['end'] > b['expiryMonth']['end']) return 1 * modifier;
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
    },
	watch: {
		selectedZone: function() {
            this.inventoryFetchBays(true);
		},
		selectedBay: function() {
			this.inventoryFetchShelves(true);
		},
		inventoryBays: function() {
			this.inventoryFetchShelves(true);
		},
		selectedShelf: function() {
			this.inventoryFetchShelfTrays();
		},
		inventoryShelves: function() {
			this.inventoryFetchShelfTrays();
		}
	},
	created () {
		if(this.isLoggedIn()) {
			this.inventoryFetchZones(true);
		}
	}
});

//$("userTable tr").click(userTableClicked($(this)));

$("#userTable tr").click(function() {               //should probably be transformed into a function like above
    var table = document.getElementById('userTable');
    var row = $(this);
    var i = 0;
    var cItem = "";
    var userDict = {firstName: "", lastName:"", username:"", role:"", canViewData:false, canEditData:false, canModifyWarehouse:false, canModifyUsers:false};
    row.addClass('tableSelected').siblings().removeClass('tableSelected');    
    row.children().each(function(item) {
        cItem = $(this).html();
        // if (cItem.substring(0,1) == " ") {
        //     cItem=cItem(1); //removes the space, happens 
        // };
        if (cItem.toLowerCase() == "true" || cItem.toLocaleLowerCase == " true"){           //so this doesn't work, all elements of a dict must be same type (I assume)
            userDict[Object.keys(userDict)[i]] = true;
        }
        else if (cItem.toLowerCase() == "false" || cItem.toLocaleLowerCase == " false"){
            userDict[Object.keys(userDict)[i]] = false;
        }
        else{
            userDict[Object.keys(userDict)[i]] = cItem;
        }
        i++;
    });
    shelfieApp.UMcurrentUser = userDict;
    console.log(shelfieApp.UMcurrentUser);
});

async function login(){
    await fetch(shelfieURL + '/auth', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({
            'email': $('#username-input').val(),
            'password': $('#passwd-input').val()
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
/**
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
*/
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

