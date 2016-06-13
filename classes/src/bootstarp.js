function bootstrap(element, applications) {
    applications.unshift('TB');
    var baseApp = TBjs.app('TB');

    function publishApi(type, obj) {
        for (var i in obj) {
            baseApp[type](i, obj[i]);
        }
        return publishApi;
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
    })('directive', tbEventDirectives);

    var injector = createInjector(applications);
    injector.invoke(['$virtualDom', '$compile', '$model',
        function($virtualDom, $compile, $model) {
            var vDom = $virtualDom();
            var rootModel = $model();
            if (element === document) {
                element = element.getElementsByTagName('html')[0];
            }

            createDomMap(element, vDom, vDom);
            $compile(vDom);

            function createDomMap(element, context, vDom) {
                var attributes = element.attributes;
                var currentVDom;
                if (element.nodeType === ELEMENT_NODE_TYPE) {
                    currentVDom = vDom.createElement(element.nodeName);
                    forEach(attributes, function(attr) {
                        currentVDom.setAttribute(attr.name, attr.value);
                    })
                    context.appendChild(currentVDom);
                    forEach(element.childNodes, function(child) {
                        createDomMap(child, currentVDom, vDom);
                    })
                } else if (element.nodeType === TEXT_NODE_TYPE) {
                    currentVDom = vDom.createTextNode(element.textContent);
                    context.appendChild(currentVDom);
                } else if (element.nodeType === COMMENT_NODE_TYPE) {
                    currentVDom = vDom.createComment(element.textContent);
                    context.appendChild(currentVDom);
                }
                currentVDom.$targetElement = element;
            }
        }
    ])
}
