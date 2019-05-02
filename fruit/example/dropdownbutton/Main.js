(function (fruit, ui) {
    fruit.ready(function () {
        var dropdownButton = new ui.DropdownButton({
            text:'DropdownButton',
            items:[
                {
                    text:'list item 1'
                },
                {
                  type:'divider'
                },
                {
                    text:'list item 2',
                    disabled:true
                },
                {
                    text:'list item 3'
                }
            ]
        });

        dropdownButton.on('execute',function(){
            console.log('execute');
        });

        dropdownButton.renderTo();
    })
})(fruit, fruit.ui);
