function $BootstrapProvider() {
    var bootstrapMinErr = minErr('bootstrap');
    this.$get = ['$rootModel', '$appCache', '$appBuilder', '$xmlEngine',
        function($rootModel, $appCache, $appBuilder, $xmlEngine) {
            return function bootstrap(element, applications) {
                var vDom = $xmlEngine('');
                var vDom.$targetElement = element;
                var createDomMap = function(element, context, vDom) {
                    var attributes = element.attributes;
                    var currentVDom;
                    if (element.nodeType === ELEMENT_NODE_TYPE) {
                        var obj = {};
                        forEach(attributes, function(attr) {
                            obj[attr.name] = attr.value;
                        })
                        currentVDom = vDom.createElement(element.nodeName);
                        currentVDom.setAttribute(obj);
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
                };
                createDomMap(element, vDom, vDom);
                forEach(applications, function(appName) {
                    var app = $appCache.get(appName);
                    if (!app) {
                        throw bootstrapMinErr('initiation', '模块{0}未注册', appName);
                    }
                    $appBuilder(vDom, app);
                })
            }
        }
    ];
}
