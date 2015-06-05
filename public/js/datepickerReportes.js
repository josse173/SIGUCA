
    $('#datepicker input').datepicker({
        format: "dd/mm/yyyy",
        daysOfWeekDisabled: "0",
        autoclose: true,
        language: "es",
        todayHighlight: true
    });

    $('#timepicker input').timepicker();

    $('.footable').footable();