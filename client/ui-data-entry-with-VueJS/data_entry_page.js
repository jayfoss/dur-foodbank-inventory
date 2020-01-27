$(function () {
    $('#datetimepicker').datetimepicker({
        format: 'd-m-Y',
        timepicker:false
    });
});

$('#button').click(function(e){
    e.preventDefault();
});