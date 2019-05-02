/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/11/12
 * Time: 9:15 PM
 * To change this template use File | Settings | File Templates.
 */
fruit.define('Demo.TextOptions', {
    extend:'fruit.ui.Component',
    view:{
        'attr':{
            'style':{
                'margin':'6px',
                'padding-bottom':6,
                'border-bottom':'dotted 1px #ccc'
            }
        },
        content:[
            {
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
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:'{name}'
                    },
                    {
                        name:"textbox",
                        type:'fruit.ui.TextBox',
                        attr:{
                            'class':'f-textbox f-col3'
                        },
                        options:{
                            text:'{value}'
                        }

                    }
                ]
            },
            {
                'attr':{
                    'class':'f-row'
                },
                content:[
                    {
                        tag:'label',
                        attr:{
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:"&nbsp;"
                    },
                    {
                        tag:'div',
                        content:[
                            {
                                tag:'span',
                                content:"Type: "
                            },
                            {
                                tag:'b',
                                content:'{type}'
                            },
                            {
                                tag:'p',
                                attr:{
                                    'class':'description-text'
                                },
                                content:'{description}'
                            }
                        ],
                        attr:{
                            'class':'f-confirmation f-col3',
                            'style':{
                                'padding':'4px'
                            }
                        }
                    }
                ]
            }
        ]
    }
})
fruit.define('Demo.SelectOptions', {
    extend:'fruit.ui.Component',
    view:{
        'attr':{
            'style':{
                'margin':'6px',
                'padding-bottom':6,
                'border-bottom':'dotted 1px #ccc'
            }
        },
        content:[
            {
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
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:'{name}'
                    },
                    {
                        name:"select",
                        type:'ComboBox',
                        options:{
                            editable:false,
                            items:'{value}',
                            text:'{currentValue}'
                        },
                        attr:{
                            style:{
                                'margin-left':14,
                                'zoom':1
                            }
                        }
                    }
                ]
            },
            {
                'attr':{
                    'class':'f-row'
                },
                content:[
                    {
                        tag:'label',
                        attr:{
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:""
                    },
                    {
                        tag:'div',
                        content:[
                            {
                                tag:'span',
                                content:"Type: "
                            },
                            {
                                tag:'b',
                                content:'{type}'
                            },
                            {
                                tag:'p',
                                attr:{
                                    'class':'description-text'
                                },
                                content:'{description}'
                            }
                        ],
                        attr:{
                            'class':'f-confirmation f-col3',
                            'style':{
                                'padding':'4px'
                            }
                        }
                    }
                ]
            }
        ]
    },
    triggers:{
        event:{
            execute:{
                source:'select',
                action:'_selectChange'
            }
        }
    },
    methods:{
        _selectChange:function (sender, args) {
            var newValue = this.select.getOption("text");
            this.select._$onPropertyChanged('value', newValue);
        }
    }
})
fruit.define('Demo.CheckBoxOptions', {
    extend:'fruit.ui.Component',
    view:{
        'attr':{
            'style':{
                'margin':'6px',
                'padding-bottom':6,
                'border-bottom':'dotted 1px #ccc'
            }
        },
        content:[
            {
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
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:'{name}'
                    },
                    {
                        name:"textbox",
                        type:'fruit.ui.CheckBox',
                        attr:{
                            style:{
                                'margin-left':14
                            }
                        },
                        options:{
                            checked:'{value}'
                        }

                    }
                ]
            },
            {
                'attr':{
                    'class':'f-row'
                },
                content:[
                    {
                        tag:'label',
                        attr:{
                            'class':'f-label f-label-bold f-col1'
                        },
                        content:"&nbsp;"
                    },
                    {
                        tag:'div',
                        content:[
                            {
                                tag:'span',
                                content:"Type: "
                            },
                            {
                                tag:'b',
                                content:'{type}'
                            },
                            {
                                tag:'p',
                                attr:{
                                    'class':'description-text'
                                },
                                content:'{description}'
                            }
                        ],
                        attr:{
                            'class':'f-confirmation f-col3',
                            'style':{
                                'padding':'4px'
                            }
                        }
                    }
                ]
            }
        ]
    }
})
fruit.define('Demo.OptionsPanel', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'f-title-panel Opions'
        },

        content:[
            {
                name:'optionsArea',
                template:{
                    content:'{optionPanel}'
                }
            }
        ]
    }
})