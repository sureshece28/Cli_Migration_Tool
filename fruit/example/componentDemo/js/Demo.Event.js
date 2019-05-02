/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/12/12
 * Time: 9:52 PM
 * To change this template use File | Settings | File Templates.
 */
fruit.define('Demo.EventItem', {
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
                tag:'h5',
                name:'paramName'
            },
            {
                tag:'div',
                name:'paramDescription',
                attr:{
                    'class':'f-confirmation',
                    'style':{
                        'margin':'4px 0px',
                        'padding':'8px'
                    }
                }

            }
        ]
    },
    options:{
        name:{
            defaultValue:null
        },

        description:{
            defaultValue:null
        }
    },
    triggers:{
        option:{
            name:{
                target:'paramName',
                action:'setText'
            },
            description:{
                target:'paramDescription',
                action:'setText'
            }
        }
    }
})
fruit.define('Demo.Event', {
    extend:'fruit.ui.Component',
    view:{
        attr:{
            'class':'f-title-panel Event'
        },

        content:[
            {
                //model:'{configs}',
                name:'EventArea',
                template:{
                    type:'Demo.EventItem',
                    options:{
                        'name':'{name}',
                        'description':'{description}'
                    }
                }
            }
        ]
    }
})