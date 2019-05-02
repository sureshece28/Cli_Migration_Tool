fruit.ready(function () {
    var btn = new fruit.ui.Button({
        text:'Open confirm'
    });

    btn.on('click', function (sender, event) {
        fruit.ui.Confirm("Are you sure?", function(){console.log("Sure!")}, function(){console.log("No!")})
    });

    btn.renderTo();
});
