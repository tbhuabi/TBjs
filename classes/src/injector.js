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
	setTimeout(function(){
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

    function invoke(provider) {
        if (isFunction(provider)) {
            return provider();
        } else if (isArray(provider)) {
            var fn = provider.pop();
            var params = provider;
            if (!isFunction(fn)) {
                throw injectorMinErr('invoke', '依赖注入最后一个参数必须为一个函数！');
            }
            forEach(params, function(providerName) {
				if(!isString(providerName)){
					throw injectorMinErr('invoke', '依赖注入项必须为字符串！');
				}
				//if(instantiate)
            })
        }
        throw injectorMinErr('invoke', 'provider必须提供 `$get` 方法！');
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
