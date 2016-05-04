var bootstrap = function(context, modules) {
    modules.forEach(function(appName) {
        var app = applications[appName]
        if (!app) {
            throw new Error('模块' + appName + '未注册');
        }
        initModule(app, appName);
    })

    function initModule(app, appName) {

        var serviceCache = {};

        var $services = app.$services;

        var createInjector = function(factoryFunction) {
            if (isFunction(factoryFunction)) {
                return new $ServiceProvider(factoryFunction);
            }
            if (isArray(factoryFunction)) {
                var fn = factoryFunction.pop();
                var args = [];
                forEach(factoryFunction, function(item) {
                    var serviceItem = serviceCache[item];
                    if (serviceItem) {
                        args.push(serviceItem.$get());
                    } else {
                        if (!$services[item]) {
                            throw new Error('模块：' + moduleName + '中，service：' + item + '未注册');
                        }
                        var serviceInstance = createInjector($services[item]);
                        serviceCache[item] = serviceInstance;
                        args.push(serviceInstance.$get());
                    }
                })
                return new $ServiceProvider(function factory() {
                    var result = fn.apply(this, args);
                    var instance;
                    if (isFunction(result)) {
                        result = new result();
                    }
                    if (isObject(result) && isFunction(result.$get)) {
                        return result.$get();
                    }
                    return result;
                })
            }
        };
        for (var key in $services) {
            if (serviceCache.hasOwnProperty(key)) continue;
            var factory = createInjector($services[key]);
            serviceCache[key] = factory;
        }

        function $ServiceProvider(factoryFunction) {
            this.$appName = appName;
            this.$get = function() {
                return factoryFunction();
            };
        }
		console.log(serviceCache)
    };
};
