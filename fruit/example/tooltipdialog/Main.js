fruit.ready(function () {
    var tdlg=new fruit.ui.TooltipDialog({
        'items': [
            {text:"item1"},
            {text:"item2"},
            {text:"item3"},
            {text:"item4"}
        ]
    });
    var btn=new fruit.ui.Button({
        text:"Button"
    });
    //console.log(tdlg);
    fruit.Application.load(tdlg);
    fruit.Application.load(btn);
});