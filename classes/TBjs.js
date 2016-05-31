var TB = {
    version: '1.0.0',
    //app: $AppProvider().$get(),
    //$http: $HttpProvider().$get(),
    //$: $QueryProvider().$get(),
    bootstrap: function(element, applications) {
        var TBjsInit = injector($provider.bootstrap.instance.$get());
        TBjsInit(element, applications);
    }
};
