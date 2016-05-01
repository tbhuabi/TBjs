var TBModules = {};

var TB = {
    version: '1.0.0',
    module: $ModuleProvider().$get(),
    $http: $HttpProvider().$get(),
    $: $QueryProvider().$get(),
    bootstrap: bootstrap
};
