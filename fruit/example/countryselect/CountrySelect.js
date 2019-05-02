(function (fruit, ui, lang, dom, keys) {
    fruit.define('fruit.ui.CountrySelectItem', {
        extend:'fruit.ui.ListItem',
        view:{
            tag:'li',
            attr:{
                'class':'f-list-item',
                role:'listitem'
            },
            content:[
                {
                    tag:'span',
                    name:'number',
                    attr:{
                        'class':'f-country-timezone'
                    }
                },
                {
                    tag:'span',
                    attr:{
                        'class':'f-country-field'
                    },
                    content:[
                        {
                            tag:'i',
                            name:'icon',
                            attr:{
                                'class':'icon-country'
                            }
                        },
                        {
                            tag:'span',
                            name:'text',
                            attr:{
                                'class':'f-combobox-text'
                            }
                        }
                    ]
                }
            ]
        },
        options:{
            number:{
                defaultValue:null
            }
        },
        triggers:{
            option:{
                number:{
                    target:'number',
                    action:'setText'
                }
            }
        }
    });

    fruit.define('fruit.ui.CountrySelect', {
        extend:'fruit.ui.Component',
        view:{
            tag:'span',
            attr:{
                'class':'f-combobox',
                'role':'combobox',
                'tabIndex':0,
                'aria-haspopup':true,
                'aria-expanded':false
            },
            content:[
                {
                    tag:'span',
                    attr:{
                         'class':'f-combobox-field'
                    },
                    content:[
                        {
                            tag:'i',
                            name:'icon',
                            attr:{
                                'class':'icon-country'
                            }
                        },
                        {
                            tag:'span',
                            name:'text',
                            attr:{
                                'class':"f-combobox-text"
                            }
                        },
                        {
                            tag:'span',
                            name:'number',
                            attr:{
                                'class':"hidden"
                            }
                        }
                    ]
                },
                {
                    name:'btn',
                    tag:'span',
                    attr:{
                        'class':'f-combobox-btn'
                    }
                },
                {
                    name:'popup',
                    type:'Popup',
                    attr:{
                        'aria-labelledby':'combobox'
                    },
                    content:{
                        name:'list',
                        type:'List',
                        options:{
                            itemTemplate:{
                                type:'fruit.ui.CountrySelectItem',
                                options:{
                                    text:'{text}',
                                    icon:'{icon}',
                                    number:'{number}',
                                    type:'{type}',
                                    disabled:'{disabled}'
                                }
                            }
                        }
                    }
                }
            ]
        },
        options:{
            /**
             * @cfg {Number} selectedIndex
             * Get or set the selected index of the CountrySelect
             * @example 1
             */
            selectedIndex:{
                defaultValue:0,
                acceptTypes:['Number']
            },
            /**
             * @cfg {Array} items
             * Get or set the items of the ComboBox.
             * Array type
             * @example ['Alabama', 'Alaska', 'California', 'Connecticut', 'Delaware']
             */
            items:{
                defaultValue:null,
                acceptTypes:['Array', 'Null', 'Object']
            }
        },
        triggers:{
            option:{
                items:{
                    target:'list',
                    action:'setOption',
                    params:['items', '#value#']
                }
            },
            event:{
                keydown:{
                    action:'__keydown'
                },
                click:{
                    action:'__click'
                },
                execute:{
                    source:'list',
                    action:'__list_execute'
                },
                cancel:{
                    source:'list',
                    action:'__list_cancel'
                }
            }
        },
        entity:{
            init:function () {
                this.focusable = true;
                var selectedIndex = this.getOption('selectedIndex');
                var item = this.list.getItem(selectedIndex);
                this.selectItem(item);
            },
            /**
             * Open the menu of ComboBox.
             * @method open
             */
            open:function () {
                if (!this.popup.opened) {
                    this.popup.open('auto', {y:-1});
                    this.setAttribute('aria-expanded', true);
                    this.__listfocused = true;
                    this.list.focus();
                }
            },
            /**
             * close the menu of ComboBox.
             * @method close
             */
            close:function () {
                if (this.popup.opened) {
                    this.popup.close();
                    this.setAttribute('aria-expanded', false);
                    this.__listfocused = false;
                    this.text.focus();
                }
            },
            selectItem:function (item) {
                if (item) {
                    var model = item.getModel();
                    var index = item.getIndex();
                    this.setOption('selectedIndex', index);
                    this.icon.setClass(model.icon);
                    this.text.setText(model.text);
                    this.number.setText(model.number);
                }
            },
            __click:function () {
                if (this.popup.opened) {
                    this.close();
                }
                else {
                    this.open();
                }
            },
            __keydown:function (sender, evt) {
                if (event.hasSystemKey) {
                    return;
                }
                switch (event.keyCode) {
                    case keys.SPACE:
                    case keys.ENTER:
                    case keys.DOWN_ARROW:
                        if (this.popup.opened) {
                            this.close();
                        }
                        else {
                            this.open();
                        }
                        break;
                }
            },
            __list_mousedown:function (sender, args) {
                args.preventDefault();
            },
            __list_execute:function (sender, event) {
                this.selectItem(event.item);
                this.close();
            },
            __list_cancel:function () {
                this.close();
            }
        }
    });
})(fruit, fruit.ui, fruit.lang, fruit.util.dom, fruit.util.keys);
