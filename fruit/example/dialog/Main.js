fruit.ready(function () {
    var btn = new fruit.ui.Button({
        text:'Open Dialog'
    });

    var dlg = new fruit.ui.Dialog({
        header:'Dialog Title'
    });

    btn.on('click', function (sender, event) {
        dlg.open();
    });

    btn.renderTo();
    dlg.renderTo();
});
