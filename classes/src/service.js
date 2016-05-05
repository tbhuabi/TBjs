var $ServiceProvider = function $ServiceProvider(appName, factoryFunction) {
    this.$appName = appName;
    this.$get = function() {
        return factoryFunction();
    };
}
