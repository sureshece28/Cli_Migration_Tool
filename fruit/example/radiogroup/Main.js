(function (fruit, ui) {
    fruit.ready(function () {
        var main = new fruit.ui.RadioGroup({
            items:[
                {text:'Apple', value:'Apple', disabled:true},
                {text:'Orange', value:'Orange', checked:true},
                {text:'Banana', value:'Banana', checked:false},
                {text:'Mango', value:'Mango'},
                {text:'Pear', value:'Pear', disabled:true}
            ]
        });
        fruit.Application.load(main);
    });

})(fruit, fruit.ui);