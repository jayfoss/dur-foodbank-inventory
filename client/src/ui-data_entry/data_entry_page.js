$(function () {
    $('#datetimepicker').datetimepicker({
        format: 'd-m-Y',
        timepicker:false
    });
});

$(function () {
    $('#numpad').mobiscroll().numpad({
        theme: 'ios',
        themeVariant: 'light',
        min: 1,
        scale: 2,
        preset: 'decimal'
    });
});