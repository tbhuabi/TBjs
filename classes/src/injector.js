function createInjector(providers, application) {
    return function(providerName, factoryFunction) {
        var providersInstance = application.providers;

        factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;

        var params = factoryFunction.slice(0, factoryFunction.length - 1);
        factoryFunction = factoryFunction[factoryFunction.length - 1];
        var args = [];
        forEach(params, function(param) {
            var instance = providersInstance[param];
            if (instance) {
                args.push(instance);
                return;
            }

            var provider = providers[param];
            instance = createInjector(providers, application)(param, provider).$get();
            providerInstance[param] = instance;
            args.push(instance);
        })
        var newProvider = {};
        factoryFunction.apply(newProvider, args);
        return newProvider;
    }
}
