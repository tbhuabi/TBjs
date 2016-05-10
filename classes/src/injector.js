var $InjectorProvider = function $InjectorProvider() {
    this.$get = function() {
        return Injector;
    };

    var injectorMinErr('$InjectorProvider');

    function Injector(factoryFunction) {
        if (!(this instanceof Injector)) return new Injector(factoryFunction);
        factoryFunction = isFunction(factoryFunction) ? [factoryFunction] : factoryFunction;
        var params = factoryFunction.slice(0, factoryFunction.length - 1);
        factoryFunction = factoryFunction[factoryFunction.length - 1];
        var args = [];
        forEach(params, function(param) {
            if (!$provider.param) {
                throw injectorMinErr('injector', '注入依赖失败，provider：{0}未注册！', param);
            }
            args.push($provider.param.$get());
        })
        this.instance = factoryFunction.apply({}, args);
    }
};
$provider.injector = new $InjectorProvider().$get();
