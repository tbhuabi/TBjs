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
        $async: $AsyncProvider,
        $lexer: $LexerProvider,
        $model: $ModelProvider,
        $module: $ModuleProvider,
        $parse: $ParseProvider,
        $promise: $PromiseProvider,
        $query: $QueryProvider,
        $virtualDom: $VirtualDomProvider,
        $directive: $DirectiveProvider
    })('directive', tbEventDirectives)('directive', {
        tbModule: tbModuleDirective,
        tbShow: tbShowDirective,
        tbClass: tbClassDirective,
        tbInit: tbInitDirective,
        tbIf: tbIfDirective,
        tbFor: tbForDirective,
        tbModel: tbModelDirective,
        tbTemplate: tbTemplateDirective,
        tbStyle: tbStyleDirective
    });

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
                if (element.nodeType === NODE_TYPE_ELEMENT) {
                    currentVDom = vDom.createElement(element.nodeName);
                    forEach(attributes, function(attr) {
                        currentVDom.setAttribute(attr.name, attr.value);
                    })
                    context.appendChild(currentVDom);
                    forEach(element.childNodes, function(child) {
                        createDomMap(child, currentVDom, vDom);
                    })
                } else if (element.nodeType === NODE_TYPE_TEXT) {
                    currentVDom = vDom.createTextNode(element.textContent);
                    context.appendChild(currentVDom);
                } else if (element.nodeType === NODE_TYPE_COMMENT) {
                    currentVDom = vDom.createComment(element.textContent);
                    context.appendChild(currentVDom);
                }
                currentVDom.$targetElement = element;
            }
        }
    ])
}
