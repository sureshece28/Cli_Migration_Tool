/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/12/12
 * Time: 9:16 PM
 * To change this template use File | Settings | File Templates.
 */
fruit.define('Demo.APIItem', {
    extend:'fruit.ui.Component',
    view:{
        tag:'div',
        'attr':{
            'class':'f-row',
            'style':{
                'margin':'6px'

            }
        },
        content:[
            {
                tag:'label',
                attr:{
                    'class':'f-label f-label-bold'
                },
                name:'name',
                content:'{name}'
            },
            {
                tag:'span',
                content:'{type}',
                attr:{
                    'class':'paramType'
                }
            },
            {
                tag:'div',
                content:'{description}',
                attr:{
                    'class':'f-confirmation',
                    'style':{
                        'margin':'4px 0px',
                        'padding':'8px'
                    }
                }

            },
            {
                name:"textbox",
                type:'fruit.ui.TextBox',
                options:{
                    // 'hidden':'{param.length}',
                    'text':'{example}',
                    'visible':"{param.length}"
                }

            },
            {
                name:"btn",
                type:'fruit.ui.Button',
                options:{
                    'text':'Run'
                }
            }
        ]
    },
    triggers:{
        event:{
            click:{
                source:'btn',
                action:'_btnClick'
            }
        }
    },
    methods:{
        syncModel:function () {
            this.superMethod(arguments);
            if (this.textbox.getOption("text") == "") {
                    this.textbox.hide();
            }
        },
        _btnClick:function () {
            var preview = fruit.ui.getComponentById("preview");
            preview.runAPI(this.name.getText(), this.textbox.getOption("text"))
        }
    }
})
fruit.define('Demo.API', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'f-title-panel API'
        },

        content:[
            {
                //model:'{configs}',
                name:'APIArea',
                template:{
                    type:'Demo.APIItem'
                }
            }
        ]
    },
    methods:{
        init:function () {

        }
    }

})