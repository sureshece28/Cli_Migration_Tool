/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/13/12
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */
fruit.define('Demo.Code', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'f-title-panel code'
        },
        content:[
            {
                tag:'div',
                attr:{
                    'class':'f-title-panel-header'
                },
                content:'Code'
            },
            {
                tag:'pre',
                name:'precode',
                attr:{
                    'class':'prettyprint'
                }
            }
        ]
    },
    methods:{
        init:function () {
            fruit.Application.on('updateComponent', this.updateCode, this);
        },
        updateCode:function () {
            var componentModel = currentComponentModel;
            var componentName = componentModel.component.name;
            var optionsString = "";
            var tempAry = [];
            for (var i = 0; i < componentModel.configs.length; i++) {
                // l(typeof(model.configs[i].value));
                // l(model.configs[i].value);
                var type = componentModel.configs[i].type;

                switch (type) {
                    case "Enum":

                        tempAry.push(componentModel.configs[i].name + ":\"" + componentModel.configs[i].currentValue + "\"");
                        break;
                    case "String":
                        if (componentModel.configs[i].value != null) {
                            tempAry.push(componentModel.configs[i].name + ":\"" + componentModel.configs[i].value + "\"");
                        } else {
                            tempAry.push(componentModel.configs[i].name + ":" + componentModel.configs[i].value);
                        }

                        break;
                    default :
                        tempAry.push(componentModel.configs[i].name + ":" + componentModel.configs[i].value);
                        break;

                }

            }

            optionsString = "{" + tempAry.join(",") + "}";
            var str = "";
            str += 'var component = new ' + componentName + '(';
            str += js_beautify(optionsString);
            str += ');\r';
            for (var i = 0; i < componentModel.events.length; i++) {
                var methodName = componentModel.events[i].name;
                str += 'component.on("' + methodName + '"';
                str += ',function() {console.log("' + methodName + '");});';
                //tempAry.push(methodName + ":function() {console.log('" + methodName + "')}");
            }

            str += "component.renderTo('componentNode');";
            //str+="app.load(component, document.getElementById('componentNode'));"
            this.precode.setText(js_beautify(str));
            setTimeout(prettyPrint, 0);
        }

    }
})