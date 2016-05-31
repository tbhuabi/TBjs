function $DirectiveProvider(appName, factoryFunction) {
    this.$appName = appName;
    this.$get = function() {
        return factoryFunction();
    };
};
