fruit.define('Demo.Preview', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'f-title-panel preview'
        },
        content:[
            {
                tag:'div',
                attr:{
                    'class':'f-title-panel-header'
                },
                content:'Demo'
            },
            {
                name:'iframe',
                type:'fruit.ui.Iframe',
                attr:{
                    'class':'preview'
                },
                options:{
                    'src':'demo.html?123'

                }
            }
        ]
    },
    triggers:{
        event:{
            load:{
                source:'iframe',
                action:'loadComponent'
            }
        }
    },
    methods:{
        init:function () {
            fruit.Application.on('updateComponent', this.__load, this);
        },
        generateOption:function (sender, args) {
            var model = currentComponentModel;
            var componentName = model.component.name;
            var optionsString = "";
            var tempAry = [];
            for (var i = 0; i < model.configs.length; i++) {
                // l(typeof(model.configs[i].value));
                // l(model.configs[i].value);
                var type = model.configs[i].type;

                switch (type) {
                    case "Enum":

                        tempAry.push(model.configs[i].name + ":\"" + model.configs[i].currentValue + "\"");
                        break;
                    case "String":
                        if (model.configs[i].value != null) {
                            tempAry.push(model.configs[i].name + ":\"" + model.configs[i].value + "\"");
                        } else {
                            tempAry.push(model.configs[i].name + ":" + model.configs[i].value);
                        }
                        break;
                    default :
                        tempAry.push(model.configs[i].name + ":" + model.configs[i].value);
                        break;

                }

            }
            for (var i = 0; i < model.events.length; i++) {
                var methodName = model.events[i].name;
                tempAry.push(methodName + ":function() {l('" + methodName + "')}");
            }
            this.optionsString = "{" + tempAry.join(",") + "}";
            this.componentName = componentName;
        },
        loadComponent:function () {

            try {
                this.generateOption();
                var opts = eval('(' + this.optionsString + ')');
                if (this.model.component.name && this.iframe.element.element.contentWindow.setComponent) {
                    this.iframe.element.element.contentWindow.setComponent(this.model.component.name, opts);
                }
            } catch (_) {
               // console.log(_);
            }
        },
        __load:function(){
            this.loadComponent();
        },

        runAPI:function (methodName, param) {
            this.iframe.element.contentWindow.runAPI(methodName, param);
        }
    }
});
