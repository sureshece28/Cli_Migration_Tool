var slice = Array.prototype.slice;
var info;

fruit.io.load.style('../common/console.css');


logger.setLogger(function (type) {
    var args = slice.call(arguments[1], 0);
    if (type == 'log') {
        return;
    }
    var item = document.createElement('li');
    item.className = 'console-' + type
    item.innerHTML = type + ">" + args.join(',');
    if (!info) {
        info = document.getElementById("console");
    }
    info.appendChild(item);
    item = null
});

fruit.define('Demo.Console', {
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
                content:'Console'
            },
            {
                tag:'ul',
                options:{
                    'id':'console'
                },
                attr:{

                    'class':'console'
                }
            }
        ]
    }
});

fruit.define('Demo.Code', {
    extend:'fruit.ui.Component',
    triggers:{
        event:{
            ready:{
                action:'__onLoaded'
            }
        }
    },

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
        setCode:function (str) {
            this.precode.setText(str);
            setTimeout(prettyPrint, 0);
        },
        __onLoaded:function () {
            var me = this;

            $('.demo-source').each(function (i, el) {
                var code = el.innerHTML;
                eval(code);
                me.setCode(code);
            })
        }
    }
});
fruit.define('Demo.Main', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'container'
        },
        content:[
            {
                tag:'div',
                attr:{
                    'class':'f-row-fluid'
                },
                content:[
                    {
                        tag:'div',
                        attr:{
                            'class':'f-col12'
                        },
                        content:[
                            {
                                name:"console",
                                type:'Demo.Console'
                            }
                        ]
                    }
                ]
            },
            {
                tag:'div',
                attr:{
                    'class':'f-row-fluid'
                },
                content:[
                    {
                        tag:'div',
                        attr:{
                            'class':'f-col12'
                        },
                        content:[
                            {
                                name:"codePanel",
                                type:'Demo.Code'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});

fruit.ready(function () {
    fruit.config.debug = true;

    var demoComponent = fruit.create("Demo.Main", {});
    demoComponent.renderTo();


});
