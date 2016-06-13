function $CompileProvider() {
    var compileMinErr = minErr('compiler');
    var interpolateSymbol = {
        start: '{{',
        end: '}}'
    };
    this.interpolateSymbol = interpolateSymbol;
    this.$get = ['$injector', '$parse', '$virtualDom', '$query',
        function($injector, $parse, $virtualDom, $query) {
            var startSymbol = interpolateSymbol.start;
            var endSymbol = interpolateSymbol.end;

            function hasModule(name) {
                return $injector.has(name + 'Module');
            }

            function hasDirecrtive(name) {
                return $injector.has(name + 'Directive');
            }

            function nameNormalize(name) {
                return name.toLowerCase().replace(/-\w/g, function(str) {
                    return str.charAt(1).toUpperCase();
                })
            }

            return function compile(domElement) {
                if (isString(domElement)) {
                    domElement = $virtualDom(domElement);
                }

                if (!domElement.$ENGINE) {
                    throw compileMinErr('params', '编译模板的参数只能为字符串或一个虚拟DOM对象！');
                }

                compileDomTree(domElement);

                function compileDomTree(vDom) {
                    switch (vDom.nodeType) {
                        case ELEMENT_NODE_TYPE:
                            if (hasModule(nameNormalize(vDom.tagName))) {
                                compileModuleNode(vDom)
                            }
                            var attributes = vDom.attributes;
                            var directiveQueue = [];
                            forEach(attributes, function(attr) {
                                if (isString(attr.value)) {
                                    compileInterpolateExpression(attr.value)
                                }
                                var directiveName = nameNormalize(attr.name);
                                if (hasDirecrtive(directiveName)) {
                                    directiveQueue.push($injector.get(directiveName + 'Directive'));
                                }
                            })
                            directiveQueue.sort(function(n, m) {
                                return n.priority - m.priority;
                            })
                            forEach(directiveQueue, function(directiveInstance) {
                                directiveInstance.controller(null, $query(vDom), null)
                            })
                            if (vDom.childNodes) {
                                forEach(vDom.childNodes, function(ele) {
                                    compileDomTree(ele);
                                })
                            }
                            console.log(directiveQueue)
                            break;
                        case TEXT_NODE_TYPE:
                            compileInterpolateExpression(vDom.textContent);
                            break;
                        case DOCUMENT_NODE_TYPE:
                            forEach(vDom.childNodes, function(ele) {
                                compileDomTree(ele);
                            })
                            break;
                    }

                }

                function compileAttrbute() {

                }

                function compileInterpolateExpression() {

                }

                function compileModuleNode() {

                }
            }
        }
    ]
}
