var targetFileName = "xfruit.js";
var rootPath = "../../js/xFruit/";
var json2Path = "../../3rdparty/json2.js";
var jquery = "../../3rdparty/jquery1.7.1.js";
var implementInstancePath = "../../js/xFruit/implement/fruit/";
var filePathObj = {
    "core":{
        "util":{
            dependencies:[],
            path:[
                "core/util/core.js",
                "core/util/logger.js",
                "core/util/string.js",
                "core/util/array.js",
                "core/util/lang.js",
                "core/util/browser.js",
                "core/util/os.js",
                "core/util/date.js",
                "core/util/func.js",
                "core/util/i18n.js",
                "core/util/url.js",
                "core/util/keys.js",
                "core/util/css.js"
            ]
        },
        "OOP":{
            dependencies:["core.util"],
            path:[
                "core/oop/namespace.js",
                "core/oop/mirror.js",
                "core/oop/class.js",
                "core/oop/options.js",
                "core/oop/interface.js",
                "core/oop/observable.js"
            ]
        },
        "Ajax":{
            dependencies:["core.oop"],
            path:[
                "core/io/IRequest.js",
                "core/io/ajax.js",
                implementInstancePath + "request.js"
                //"../../js/xFruit/implement/jQuery/" + "request.js"
            ]
        },
        "WebSocket":{
            dependencies:["core.oop"],
            path:[
                "core/io/webscokect.js"
            ]
        },
        "RESTful":{
            dependencies:["core.oop"],
            path:[
                "core/io/REST.js"
            ]
        },
        "FX":{
            dependencies:["core.oop"],
            path:[
                "core/fx/IEffects.js",
				"core/fx/Animator.js"
            ]
        },
        "dom":{
            dependencies:["core.oop"],
            path:[
                "core/dom/IElement.js",
                implementInstancePath + "Element.js",
                "core/dom/IElementCollection.js",
                implementInstancePath + "ElementCollection.js",
                "core/dom/IElementFactory.js",
                implementInstancePath + "Elementfactory.js",
//                implementInstancePath + "dom.js", //todo : update
                "core/dom/cache.js",
                "core/dom/position.js",
                "core/dom/dom.hack.js",
                "core/dom/HighContrastMode.js"
            ]
        },
        "event":{
            dependencies:["core.dom"],
            path:[
                "core/event/event-core.js",
                "core/event/event-fix.js"
            ]
        },
        "event-touch":{
            dependencies:["core.touch"],
            path:[
                "core/event/event-touch.js"
            ]
        },
        "AMD":{
            dependencies:["core.oop"],
            path:[
//                "core/amd/amd.js",
//                "core/amd/amd.plugin.js"
            ]
        }
    },
    "ui":{

        "MVVM":{
            dependencies:['core'],
            path:[
                "ui/mvvm/ModelManager.js",
                "ui/mvvm/ViewModel.js",
                "ui/mvvm/ViewModelCollection.js"
            ]
        },
        "core":{
            dependencies:['ui.MVVM'],
            path:[
                "ui/core/ViewManager.js",
                "ui/core/OptionManager.js",
                "ui/core/Node.js",
                "ui/core/Behavior.js",
                "ui/core/core.js",
                "ui/core/Application.js"
            ]
        },
        "behavior":{
            dependencies:['compoment.core'],
            path:[
                "ui/behavior/DraggableBehavior.js",
                //"ui/behavior/ResizableBehavior_bak.js",
                "ui/behavior/ResizableBehavior.js",
                "ui/behavior/TooltipBehavior.js",
                "ui/behavior/PlaceholderBehavior.js"
            ]
        },
        "base":{
            dependencies:['compoment.behavior'],
            path:[
                "ui/base/List.js",
                "ui/base/LoadContainer.js",
                "ui/base/Popup.js",
                "ui/base/Tooltip.js"

            ]
        },
        "form":{
            dependencies:['compoment.base'],
            path:[
                "ui/form/Form.js",
                "ui/form/Validation.js",
                "ui/form/Field.js"

            ]
        },
        "Button":{
            dependencies:['compoment.behavior'],
            path:["ui/form/Button.js"]
        },
        "CheckBox":{
            dependencies:['compoment.behavior'],
            path:["ui/form/CheckBox.js"]
        },
        "ComboBox":{
            dependencies:['compoment.base'],
            path:["ui/form/ComboBox.js"]
        },
        "ComboButton":{
            dependencies:['compoment.base'],
            path:["ui/form/ComboButton.js"]
        },
        "DropdownButton":{
            dependencies:['compoment.base'],
            path:["ui/form/DropdownButton.js"]
        },
        "NumberSpinner":{
            dependencies:['compoment.behavior'],
            path:["ui/form/NumberSpinner.js"]
        },
        "Radio":{
            dependencies:['compoment.behavior'],
            path:["ui/form/Radio.js", "ui/form/RadioGroup.js"]
        },
        "TextBox":{
            dependencies:['compoment.behavior'],
            path:["ui/form/TextBox.js"]
        },
        "Textarea":{
            dependencies:['compoment.behavior'],
            path:["ui/form/Textarea.js"]
        },
        "SearchBox":{
            dependencies:['compoment.behavior'],
            path:["ui/form/SearchBox.js"]
        },
        "Accordion":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Accordion.js"]
        },
        "Calendar":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Calendar.js"]
        },
        "DataGrid":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/DataGrid.js"]
        },
        "Dialog":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Dialog.js"]
        },
        "Alert":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Alert.js"]
        },
        "Confirm":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Confirm.js"]
        },
        "Loading":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Loading.js"]
        },
//        "Menu":{
//            dependencies:['compoment.behavior'],
//            path:["ui/widget/Menu.js"]
//        },
        "Tab":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Tab.js"]
        },
        "TooltipDialog":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/TooltipDialog.js"]
        },
        "Tree":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Tree.js"]
        },
        "Notification":{
            dependencies:['compoment.behavior'],
            path:["ui/widget/Notification.js"]
        }
    },
    "app":{
        "Router":{
            dependencies:['core'],
            path:["app/Router.js"]
        },
        "Frame":{
            dependencies:['app.Router', "ui.base"],
            path:["app/Frame.js"]
        },
        "Site":{
            dependencies:['app.Router'],
            path:["app/Site.js"]
        },
        "Cookie":{
            dependencies:['core'],
            path:["app/Cookie.js"]
        },
        "SPI":{
            dependencies:['core'],
            path:[
                "app/spi-io/pagerequest.js",
                "app/spi-io/spirequest.js",
                "app/spi-io/mergespirequest.js",
                "app/spi-io/ajax.js",
                "app/spi-io/load.js"
            ]
        },
        "store":{
        	dependencies:["core"],
        	path:[
        		"app/store/IStore.js",
        		"app/store/ajaxStore.js"
        	]
        }
    },
    "graphic":{
        "core":{
            dependencies:['core'],
            path:["ui/graphic/SVGGraphic.js","ui/graphic/VMLGraphic.js","ui/graphic/GraphicManager.js","ui/graphic/core.js"]
        },
        "Pie":{
            dependencies:['graphic.core'],
            path:["ui/graphic/Pie.js"]
        },
        "Topology":{
            dependencies:['graphic.core'],
            path:["ui/graphic/Topology.js"]
        }
    }
}
var path = "";
var scripts = document.getElementsByTagName('script');
var host = window.location.hostname;
for (i = 0, ln = scripts.length; i < ln; i++) {
    scriptSrc = scripts[i].src;
    match = scriptSrc.match(targetFileName);
    if (match) {
        path = scriptSrc.substring(0, scriptSrc.length - match[0].length);
        break;
    }
}

function combineUrl(inPath, inConsiderablePath) {

}

document.write('<script type="text/javascript" src="' + path + json2Path + '"></script>');
//document.write('<script type="text/javascript" src="' + path + jquery + '"></script>');

//var antpath = [];
//antpath.push('<path path="${lib}/json2.js"/>');
for (var i in filePathObj) {
    var package = filePathObj[i];
    for (var j in package) {
        var files = package[j].path;
        for (var h = 0; h < files.length; h++) {
            //console.log(files[h]);
            document.write('<script type="text/javascript" src="' + path + rootPath + files[h] + '"></script>');
            //antpath.push('<path path="${js}/'+files[h]+'"/>');
        }
    }
}
//console.dir(antpath.join("\r"));

