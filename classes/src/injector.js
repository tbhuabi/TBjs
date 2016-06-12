function createInjector(applications) {

    var injectorMinErr = minErr('Injector');

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
    setTimeout(function() {
        console.log(providerCache)
        console.log(instanceCache)
    })

    function appInit(appName) {
        var app = TBjs.app(appName);
        var requires = app.requires || [];
        var invokeQueue = app.invokeQueue;
        forEach(requires, function(appName) {
            loadApplication(appName);
        })
        var providerCollection = providerCache[appName] = providerCache[appName] || {};
        forEach(requires, function(requireAppName) {
            extend(providerCache[appName], providerCache[requireAppName])
        })
        forEach(invokeQueue, function(methodRecipe) {
            providerFactory[methodRecipe[0].toLowerCase()](providerCollection, methodRecipe[1], methodRecipe[2], methodRecipe[0]);
        })
    }

    function provider(providerCollection, providerName, factoryFunction) {
        providerCollection[providerName + 'Provider'] = new factoryFunction();
    }

    function supportProvider(providerCollection, moduleName, factoryFunction, methodName) {
        provider(providerCollection, moduleName + methodName, function() {
            this.$get = factoryFunction;
        })
    }

    function loadApplication(appName) {
        appInit(appName);
    }

    function createInternalInjector(provider, appName) {
        var $getFn = provider.$get;
        if (isFunction($getFn)) {
            return $getFn.call(provider);
        } else if (isArray($getFn)) {
            var fn = $getFn.pop();
            var params = provider;
            var args = [];
            if (!isFunction(fn)) {
                throw injectorMinErr('invoke', '依赖注入最后一个参数必须为一个函数！');
            }
            forEach(params, function(providerName) {
                if (!isString(providerName)) {
                    throw injectorMinErr('invoke', '依赖注入项必须为字符串！');
                }
                if (instanceCache[providerName]) {
                    args.push(instanceCache[providerName])
                } else if (providerCache[providerName]) {
                    var providerInstance = createInternalInjector(providerName, appName);
                    instanceCache[providerName] = providerInstance;
                    args.push(providerInstance)
                } else {
                    throw injectorMinErr('invoke', '应用 {0} 中，{1}未注册！', appName, providerName);
                }
            })
            return fn.apply(provider, args);
        }
        throw injectorMinErr('invoke', 'provider必须提供 `$get` 方法！');
    }

    function invoke(provider, appName) {
		return createInternalInjector(provider,appName);
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
