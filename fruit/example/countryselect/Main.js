fruit.ready(function () {
    var cbx = new fruit.ui.CountrySelect({
        items:[
            {text:'Albania', icon:'flag flag-al', number:'001'},
            {text:'Andorra', icon:'flag flag-ad', number:'002'},
            {text:'Austria', icon:'flag flag-at', number:'003'},
            {text:'Belarus', icon:'flag flag-by', number:'004'},
            {text:'Belgium', icon:'flag flag-be', number:'005'},
            {text:'Bosnia and Herzegovina', icon:'flag flag-ba', number:'006'},
            {text:'Bulgaria', icon:'flag flag-bg', number:'007'},
            {text:'Croatia', icon:'flag flag-hr', number:'008'},
            {text:'Czech Republic', icon:'flag flag-cz', number:'009'},
            {text:'Denmark', icon:'flag flag-dk', number:'010'},
            {text:'Estonia', icon:'flag flag-ee', number:'011'},
            {text:'Faroe Islands', icon:'flag flag-fo', number:'012'}
        ],
        placeHolder:"Please input"

    });
    fruit.Application.load(cbx);
});
