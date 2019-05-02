fruit.define('fruit.ui.Iframe', {
    extend:'fruit.ui.Component',
    view:{
        tag:'iframe'
    },
    options:{
        src:{
            defaultValue:null,
            bindings:[
                {
                    property:'src'
                }
            ]
        }
    },
    triggers:{
        option:{
            src:{
                action:'setAttribute',
                params:['src', '#value#']
            }
        }
    },
    methods:{
        init:function () {

            var self = this;
            fruit.event.Engine.addEvent(this.element.element, 'load', function () {
                self.__load();
            }, false);

        },
        __load:function () {
            this.trigger("load");
        }
    }
});
