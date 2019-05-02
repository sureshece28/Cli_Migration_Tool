(function(fruit,global){
    fruit.ready(function(){
        var tx=new fruit.ui.Textarea({
            minHeight:100,
            maxHeight:200
        });
        tx.renderTo();
    });
}(fruit,window));