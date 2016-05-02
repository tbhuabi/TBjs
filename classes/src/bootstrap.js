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

    var $ServiceProvider = function $ServiceProvider(moduleName) {
        this.$moduleName = moduleName || null;
        this.$get = function() {
			return new Services();
        };
        var services = function service() {
            this.$moduleName = null;
        }
        for (var key in TBModule.$services) {
            var factory = TBModule.$services[key];
            if (isArray(factory)) {

            }
            services.prototype[key] = (new TBModule.$services[key]()).$get();
        }
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
