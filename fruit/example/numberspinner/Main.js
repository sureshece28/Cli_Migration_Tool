fruit.ready(function() {


    var btn=new fruit.ui.Button();
    var main = new fruit.ui.NumberSpinner({
        step: 5,
        //disabled:true,
        //value:3,
        minValue:3,
        maxValue:97
    });
    fruit.Application.load(btn);
    fruit.Application.load(main);
});