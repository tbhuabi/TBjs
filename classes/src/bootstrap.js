var bootstrap = function(context, modules) {
    modules.forEach(function(mod) {
        var TBModule = TBModules[mod]
        if (!TBModule) {
            throw new Error('模块' + mod + '未注册');
        }
        initModule(TBModule);
    })
};

var initModule = function(TBModule) {
    var module = {};
    forEach(TBModule.$invokeQueue, function(item) {

    })
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
