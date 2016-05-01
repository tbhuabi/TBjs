var bootstrap = function() {
    for (var moduleName in modules) {
        var module = modules[moduleName];
    }
};



//var injector = function(module, factoryFunction) {
//    if (isFunction(factoryFunction)) {
//        return factoryFunction;
//    }
//    if (isArray(factoryFunction)) {
//        var fn = factoryFunction.pop();
//        var args = [];
//        forEach(factoryFunction, function(item) {
//            item = trim(item);
//            args.push(module.$services[item]);
//        })
//        return function factory() {
//            fn.apply(this, args);
//        }
//    }
//};
