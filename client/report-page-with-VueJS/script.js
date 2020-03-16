let reportSelect = new Vue({
    el: "#report-generate",
    data: {
        checked: false,
        checked_elements: [],
        checked_zone: [],
        checked_arr: ['Green', 'Yellow', 'Blue', 'Pink']
    },

    methods: {
        changeAllChecked: function() {
            if (this.checked) {
                this.checked_zone = this.checked_arr
            } else {
                this.checked_zone = []
            }
        }
    },
    watch: {
        "checked_zone": function() {
            if (this.checked_zone.length == this.checked_arr.length) {
                this.checked = true
            } else {
                this.checked = false
            }
        }
    }

});