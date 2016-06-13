function createInjector(applications) {

    var injectorMinErr = minErr('Injector');
    var providerSuffixName = 'Provider';

    var providerCache = {};
    var instanceCache = {};

    var providerFactory = {
        provider: provider,
        module: supportProvider,
        directive: supportProvider,
        filter: supportProvider
    };

    forEach(applications, function(appName) {
        appInit(appName);
    })

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
        providerCache[providerName + 'Provider'] = new factoryFunction();
    }

    function supportProvider(moduleName, factoryFunction, methodName) {
        provider(moduleName + methodName, function() {
            this.$get = factoryFunction;
        })
    }


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
                if (instanceCache[providerName]) {
                    args.push(instanceCache[providerName])
                } else {
                    var provider = providerCache[providerName + providerSuffixName];
                    if (provider) {
                        var providerGetFn = provider.$get;
                        if (!isFunction(providerGetFn) || !isArray) {
                            throw injectorMinErr('invoke', 'provider<{0}>必须提供$get方法！', providerName);
                        }
                        var providerInstance = invoke(providerGetFn, isFunction(providerGetFn) ? provider : undefined);
                        instanceCache[providerName] = providerInstance;
                        args.push(providerInstance);
                    } else {
                        throw injectorMinErr('invoke', 'provider：{0}未注册！', providerName);
                    }
                }
            })
            return factory.apply(self, args);
        }
        throw injectorMinErr('invoke', '{0}依赖注入格式有误！', fn + '');
    }

    function instantiate() {

    }

    function getService() {

    }

    function has() {

    }
    return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        has: has
    }
}
