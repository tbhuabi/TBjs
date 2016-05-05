var $ModuleProvider = function $ModuleProvider(appName, factoryFunction) {
    this.$appName = appName;
    this.$get = function() {
        return factoryFunction();
    };
};
