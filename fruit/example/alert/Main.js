fruit.ready(function () {
    var btn = new fruit.ui.Button({
        text:'Open Alert'
    });

    btn.on('click', function (sender, event) {
        fruit.ui.Alert("Hello World!");
    });

    btn.renderTo();
});
