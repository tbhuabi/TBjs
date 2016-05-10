var $InjectorProvider = function $InjectorProvider() {
    this.$get = function() {
        return Injector;
    };

};

function Injector(factoryFunction) {
    if (isFunction(factoryFunction)) {
        this.instance = new factoryFunction();
    } else if (isArray(factoryFunction)) {
        var args = factoryFunction.slice(0, factoryFunction.length - 1);
        factoryFunction = factoryFunction[factoryFunction.length - 1];
    }
}
