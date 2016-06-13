function bootstrap(element, applications) {
    applications.unshift('TB');
    var baseApp = TBjs.app('TB');

    function publishApi(type, obj) {
        for (var i in obj) {
            baseApp[type](i, obj[i]);
        }
    }

    publishApi('provider', {
        $ast: $AstProvider,
        $compile: $CompileProvider,
        $http: $HttpProvider,
        $lexer: $LexerProvider,
        $model: $ModelProvider,
        $module: $ModuleProvider,
        $parse: $ParseProvider,
        $promise: $PromiseProvider,
        $query: $QueryProvider,
        $virtualDom: $VirtualDomProvider
    })

    var injector = createInjector(applications);
    injector.invoke(['$virtualDom', '$compile', '$model', '$module',
        function($virtualDom, $compile, $model, $module) {
            console.log(arguments)
        }
    ])
}
