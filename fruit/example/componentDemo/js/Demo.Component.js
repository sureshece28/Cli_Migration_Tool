/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/11/12
 * Time: 6:39 PM
 * To change this template use File | Settings | File Templates.
 */
function l(str) {
    try {
        console.dir(str);
    } catch (e) {

    }
}
fruit.define('Demo.ComponentView', {
    extend:'fruit.ui.Component',
    view:{
        tag:'div',
        content:[
            {
                tag:"h3",
                content:""
            },
//            {
//                model:'{configs}',
//                template:{
//                    tag:"span",
//                    content:'{name}'
//                }
//            },
            {
                name:"preview",
                type:"Demo.Preview",
                options:{
                    id:"preview"
                }
            },
            {
                attr:{
                    'class':'f-row'
                },
                content:[
                    {
                        attr:{
                            'class':'f-col5 demo-controller-area f-tab'
                        },
                        content:[
                            {
                                tag:'ul',
                                attr:{
                                    'class':'f-tab-wrap'
                                },
                                content:[
                                    {
                                        tag:'li',
                                        content:{
                                            tag:"a",
                                            content:'Options'
                                        },
                                        attr:{
                                            'class':'f-tab-item'
                                        },
                                        name:'options_tab'
                                    },
                                    {
                                        tag:'li',
                                        content:{
                                            tag:"a",
                                            content:'API'
                                        },
                                        attr:{
                                            'class':'f-tab-item'
                                        },
                                        name:'api_tab'
                                    },
                                    {
                                        tag:'li',
                                        content:{
                                            tag:"a",
                                            content:'Events'
                                        },
                                        attr:{
                                            'class':'f-tab-item'
                                        },
                                        name:'events_tab'
                                    }
                                ]
                            },
                            {

                                name:'optionsPanel',
                                type:'Demo.OptionsPanel'
                                //model:'{configs}'
                            },
                            {
                                model:'{apis}',
                                name:'apiPanel',
                                type:'Demo.API'
                            },
                            {
                                model:'{events}',
                                name:"eventsPanel",
                                type:'Demo.Event'
                            }
                        ]
                    },
                    {
                        attr:{
                            'class':'f-col4 pull-right'
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
    },
    options:{
        optionsModel:{
            defaultValue:null
        }
    },
    triggers:{
        option:{
            optionsModel:{
                target:'optionsPanel',
                action:'setModel'
            }
        },
        event:{
            click:[
                {
                    source:'options_tab',
                    action:'__options_tab_clcik'
                },
                {
                    source:'api_tab',
                    action:'__api_tab_clcik'
                },
                {
                    source:'events_tab',
                    action:'__events_tab_clcik'
                }
            ]
        }
    },
    methods:{
        init:function () {
            this.__options_tab_clcik();
        },
        __options_tab_clcik:function () {
            this.__setTitleSelected(0);
            this.__showCodePanel(0);
        },
        __api_tab_clcik:function () {
            this.__setTitleSelected(1);
            this.__showCodePanel(1);
        },
        __events_tab_clcik:function () {
            this.__setTitleSelected(2);
            this.__showCodePanel(2);
        },
        __setTitleSelected:function (n) {
            this.options_tab.setAttribute("aria-selected", n == 0);
            this.api_tab.setAttribute("aria-selected", n == 1);
            this.events_tab.setAttribute("aria-selected", n == 2);
        },
        __showCodePanel:function (n) {
            this.optionsPanel.setStyle('display', n == 0 ? 'block' : 'none');
            this.apiPanel.setStyle('display', n == 1 ? 'block' : 'none');
            this.eventsPanel.setStyle('display', n == 2 ? 'block' : 'none');
        },
        __onIframeLoaded:function () {
            this.iframLoaded = true;
            this.optionsPanel.setUpdateButtonEnable();
        },
        log:function (str) {
            this.consolePanel.log(str);
        }
    }
})