function bootstrap(element, applications) {
    applications.unshift('TB');
    var injector = createInjector(applications);
    injector.invoke(['providerB',
        function(providerB) {

        }
    ])
}
