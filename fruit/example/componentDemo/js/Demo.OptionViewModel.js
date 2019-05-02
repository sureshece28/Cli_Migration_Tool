fruit.define('Demo.OptionViewModel', {
    extend:'fruit.ui.data.ViewModel',
    properties:{
        optionPanel:{
            get:function () {
                var optionPanel;
                switch (this.getValue('type')) {
                    case 'Enum':
                        optionPanel = new Demo.SelectOptions();
                        break;
                    case 'Boolean':
                        optionPanel = new Demo.CheckBoxOptions();
                        break;
                    default:
                        optionPanel = new Demo.TextOptions();
                        break;
                }

                this.on('edit', function (sender, event) {
                    fruit.Application.trigger('updateComponent');
                });

                optionPanel.setModel(this);

                return optionPanel;
            }
        },
        currentValue:{
            get:function () {
                var value = this.getValue('value');
                if (value && value.length > 0) {
                    return this.model.currentValue || value[0].text || value[0];
                }
            },
            set:function(value){
                this.model.currentValue = value;
                return true;
            }
        },
        value:{
            get:function () {
                var value = this.model.value;

                if (this.getValue('type') == "Enum" && fruit.util.isString(value[0])) {
                    var tempAry = [];
                    for (var i = 0; i < value.length; i++) {
                        tempAry.push({"text":value[i]});
                    }
                    //console.log(tempAry);
                    return tempAry;

                } else {
                    return value;
                }

            }
        }
    }
});