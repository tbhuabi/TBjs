var applications = {};

var TB = {
    version: '1.0.0',
    app: $AppProvider().$get(),
    $http: $HttpProvider().$get(),
    $: $QueryProvider().$get(),
    bootstrap: bootstrap
};
