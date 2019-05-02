Tester = function (count) {
    function getTime() {
        return (new Date).getTime();
    }

    var index = 0 , cache = [];

    function run() {
        var start = getTime(), obj = cache[index];
        for (var i = 0; i < count; i++) {
            obj.fn(i);
        }
        console.info(obj.name + ":" + (getTime() - start)+' ms');
        index++;
        if (index < cache.length) {
            setTimeout(function () {
                run();
            }, 500);
        }
    }


    this.run = function () {
        run();
    }
    this.push = function (name, fn) {
        cache.push({
            name:name,
            fn:fn
        });
    }
    return this;
}
