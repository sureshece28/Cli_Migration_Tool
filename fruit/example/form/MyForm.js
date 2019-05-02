(function (fruit, ui) {
    ui.define('Component', 'demo.MyFormFromHtml', {
        $events:{
            subscribe:{
                'btnSubmit':{
                    'onClick':'submit'
                }
            }
        },
        $controller:{
            submit:function () {
                alert(JSON.stringify(this.getModel()));
            }
        }
    });

    ui.define('Component', 'demo.MyFormFromJs', {
        $view:{
            attr:{
                style:{
                    width:'300px'
                }
            },
            content:{
                tag:'fieldset',
                content:[
                    {
                        tag:'legend',
                        content:'My Form From Js'
                    },
                    {
                        tag:'dl',
                        content:[
                            {
                                tag:'dt',
                                content:'First Name:'
                            },
                            {
                                tag:'dd',
                                content:{
                                    type:'TextBox',
                                    options:{
                                        text:'{firstName}'
                                    }
                                }
                            },
                            {
                                tag:'dt',
                                content:'Last Name:'
                            },
                            {
                                tag:'dd',
                                content:{
                                    type:'TextBox',
                                    options:{
                                        text:'{lastName}'
                                    }
                                }
                            },
                            {
                                tag:'dt',
                                content:'Email:'
                            },
                            {
                                tag:'dd',
                                content:{
                                    type:'TextBox',
                                    options:{
                                        text:'{email}'
                                    }
                                }
                            },
                            {
                                tag:'dd',
                                content:{
                                    type:'CheckBox',
                                    options:{
                                        text:'I Accept the Agreement',
                                        checked:'{accepted}'
                                    }
                                }
                            }
                        ]
                    },
                    {
                        tag:'p',
                        content:{
                            name:'btnSubmit',
                            type:'Button',
                            options:{
                                text:'Submit',
                                theme:'CTA'
                            }
                        }
                    }
                ]
            }
        },
        $events:{
            subscribe:{
                'btnSubmit':{
                    'onClick':'submit'
                }
            }
        },
        $controller:{
            submit:function () {
                alert(JSON.stringify(this.getModel()));
            }
        }
    });
})(fruit, fruit.ui);