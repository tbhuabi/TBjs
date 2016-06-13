function createInjector(applications) {

    var injectorMinErr = minErr('Injector');
    var providerSuffixName = 'Provider';

    var providerCache = {};
    var instanceCache = {};

    setTimeout(function() {
        console.log(providerCache)
        console.log(instanceCache)
    })
    var providerFactory = {
        provider: provider,
        module: supportProvider,
        directive: supportProvider,
        filter: supportProvider
    };
    var injector = instanceCache.$injector = createInternalInjector();

    forEach(applications, function(appName) {
        appInit(appName);
    })

    return injector;

    function appInit(appName) {
        var app = TBjs.app(appName);
        var requires = app.requires || [];
        var invokeQueue = app.invokeQueue;
        forEach(requires, function(appName) {
            appInit(appName);
        })
        forEach(invokeQueue, function(methodRecipe) {
            providerFactory[methodRecipe[0].toLowerCase()](methodRecipe[1], methodRecipe[2], methodRecipe[0]);
        })
    }

    function provider(providerName, factoryFunction) {
        providerCache[providerName + providerSuffixName] = new factoryFunction();
    }

    function supportProvider(moduleName, factoryFunction, methodName) {
        provider(moduleName + methodName, function() {
            this.$get = factoryFunction;
        })
    }

    function createInternalInjector() {
        function invoke(fn, self) {
            if (isFunction(fn)) {
                return fn.call(self);
            }
            if (isArray(fn)) {
                var factory = fn.pop();
                var params = fn;
                var args = [];
                if (!isFunction(factory)) {
                    throw injectorMinErr('invoke', '依赖注入最后一个参数必须为一个函数！');
                }
                forEach(params, function(providerName) {
                    if (!isString(providerName)) {
                        throw injectorMinErr('invoke', '依赖注入项必须为字符串！');
                    }
                    args.push(getProvider(providerName));
                })
                return factory.apply(self, args);
            }
            throw injectorMinErr('invoke', '{0}依赖注入格式有误！', fn + '');
        }

        function instantiate() {

        }

        function getProvider(name) {
            if (instanceCache[name]) {
                return instanceCache[name]
            }
            var provider = providerCache[name + providerSuffixName];
            if (provider) {
                var providerGetFn = provider.$get;
                if (!isFunction(providerGetFn) && !isArray(providerGetFn)) {
                    throw injectorMinErr('invoke', 'provider<{0}>必须提供$get方法！', name);
                }
                var providerInstance = invoke(providerGetFn, isFunction(providerGetFn) ? provider : undefined);
                instanceCache[name] = providerInstance;
                return providerInstance;
            }
            throw injectorMinErr('invoke', 'provider：{0}未注册！', name);
        }
        return {
            invoke: invoke,
            instantiate: instantiate,
            get: getProvider,
            has: function(name) {
                return providerCache.hasOwnProperty(name + providerSuffixName) || instanceCache.hasOwnProperty(name);
            }
        }
    }

}
