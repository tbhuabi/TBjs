var $InjectorProvider = function $InjectorProvider() {
    this.$get = function() {
        return function(factoryFunction) {
            return new Injector(factoryFunction);
        }
    };

    var injectorMinErr('$InjectorProvider');

    function Injector(factoryFunction) {
        factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;
        var params = factoryFunction.slice(0, factoryFunction.length - 1);
        factoryFunction = factoryFunction[factoryFunction.length - 1];
        var args = [];
        forEach(params, function(param) {
            var instance = $provider[param];
            if (!instance) {
                throw injectorMinErr('injector', '注入依赖失败，provider：{0}未注册！', param);
            }
            if (!isFunction(instance.$get)) {
                throw injectorMinErr('injector', 'provider：{0}未实现$get方法', param);
            }
            args.push($provider[param].$get());
        })
        var providerInstance = {};
        factoryFunction.apply(providerInstance, args);
        this.instance = providerInstance;
    }
};
var injector = new $InjectorProvider().$get();
