var $ProviderProvider = function $ProviderProvider(appName, factoryFunction) {
    this.$appName = appName;
    this.$get = function() {
        return factoryFunction();
    };
}
