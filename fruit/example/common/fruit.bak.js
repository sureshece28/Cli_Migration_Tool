var rootPath = "../../js/fruit/";
var filePath = [
    "core.js",
    "logger.js",
    "string.js",
    "env/browser.js",
    "env/os.js",
    "lang.js",
    "class.js",
     "interface.js",
    "amd.js",
    "amd.plugin.js",
    "func.js",
    "observable.js",
    "interface/Element.js",
    "interface/Elementfactory.js",
    //"model.js",

    //util
    "util/cache.js",
    "adapter/jquery/ajax.js",
    "adapter/fruit/Elementfactory.js",
    "adapter/fruit/dom.js",
    "adapter/fruit/Element.js",
    "util/event.js",
    "util/keys.js",
    "util/map.js",
    "util/position.js",
    "util/url.js",
    "util/dom.hack.js",
    "util/date.js",
//    "disp.js",
    "event/event-core.js",
    "event/event-fix.js",
    //env
    //other
    //ui
    "ui/core/Node.js",
    //
    "app/Router.js",
    //
    "ui/data/ModelManager.js",
    "ui/data/ViewModel.js",
    "ui/data/ViewModelCollection.js",
    //
    "ui/core.js",
    //ui/core
    "ui/core/ViewModel.js",
    //ui/base
    "ui/base/Popup.js",
    "ui/base/Tooltip.js",
    "ui/base/LoadContainer.js",

    //ui/behavior
    "ui/behavior/DraggableBehavior.js",
    "ui/behavior/ResizableBehavior.js",
    "ui/behavior/TooltipBehavior.js",

    //components
    "ui/Button.js",
    "ui/CheckBox.js",
    "ui/Dialog.js",
    "ui/DropdownButton.js",
    "ui/Radio.js",
    //"ui/Menu.js",
    "ui/RadioGroup.js",
    "ui/TextBox.js",
    "ui/ComboBox.js",
    "ui/ComboButton.js",
    "ui/base/List.js",
    "ui/NumberSpinner.js",
    //"ui/Textarea.js",
    "ui/Tree.js",
    "ui/DataGrid.js",
    "ui/Calendar.js",
    "ui/Loading.js",
	"ui/Tab.js",
	"ui/Accordion.js",
	"ui/TooltipDialog.js",
    //


    //io
    "io/request.js",
    "io/spirequest.js",
    "io/mergespirequest.js",
    "io/ajax.js",
    "io/load.js",

    //form
    "form/Field.js",
    "form/Validation.js",
    "form/Form.js",

    //data
    "data/field.js",
    "data/model.js",
    "data/reader.js",
    "data/writer.js",
    "data/store.js",

    //app
    "app/frame.js",


    "i18n.js"

];
var scripts = document.getElementsByTagName('script'),
    localhostTests = [
        /^localhost$/,
        /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:\d{1,5})?\b/ // IP v4
    ],
    host = window.location.hostname,
    test, path, i, ln, scriptSrc, match;

for (i = 0, ln = scripts.length; i < ln; i++) {
    scriptSrc = scripts[i].src;
    match = scriptSrc.match(/fruit\.js$/);
    if (match) {
        path = scriptSrc.substring(0, scriptSrc.length - match[0].length);
        break;
    }
}
json2Path = "../../3rdparty/json2.js";
jquery = "../../3rdparty/jquery1.7.1.js";
document.write('<script type="text/javascript" src="' + path + json2Path + '"></script>');
document.write('<script type="text/javascript" src="' + path + jquery + '"></script>');
//var antpath = [];
for (var i = 0; i < filePath.length; i++) {
    document.write('<script type="text/javascript" src="' + path + rootPath + filePath[i] + '"></script>');
    //antpath.push('<path path="${js}/'+filePath[i]+'"/>');
}
//console.dir(antpath.join("\r"));
