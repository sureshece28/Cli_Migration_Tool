/**
 * Created with JetBrains PhpStorm.
 * User: taojwu
 * Date: 9/6/12
 * Time: 1:43 PM
 * To change this template use File | Settings | File Templates.
 */
(function (fruit, ui) {
    ui.define('Component', 'demo.EditForm', {
        $view:{
            tag:'form',
            content:[
                {
                    tag:'ul',
                    content:[
                        {
                            tag:'li',
                            content:[
                                {
                                    tag:'label',
                                    attr:{
                                        'for':'name'
                                    },
                                    content:'Name:'
                                },
                                {
                                    type:'TextBox',
                                    options:{
                                        placeHolder:'test  place holder text...'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    });
})(fruit, fruit.ui);