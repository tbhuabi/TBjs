function $CompileProvider() {
    var compileMinErr = minErr('compiler');
    var interpolateSymbol = {
        start: '{{',
        end: '}}'
    };
    this.interpolateSymbol = interpolateSymbol;

    this.$get = ['$parse', '$virtualDom', '$query', '$directive', '$module',
        function($parse, $virtualDom, $query, $directive, $module) {
            var startSymbol = interpolateSymbol.start;
            var endSymbol = interpolateSymbol.end;
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
                        case NODE_TYPE_ELEMENT:
                            if ($module.has(nameNormalize(vDom.tagName))) {
                                compileModuleNode(vDom)
                            }
                            var attributes = vDom.attributes;
                            var directiveQueue = [];
                            forEach(attributes, function(attr) {
                                if (isString(attr.value)) {
                                    compileInterpolateExpression(attr.value)
                                }
                                var directiveName = nameNormalize(attr.name);
                                if ($directive.has(directiveName)) {
                                    directiveQueue.push($directive.get(directiveName));
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
                        case NODE_TYPE_TEXT:
                            compileInterpolateExpression(vDom.textContent);
                            break;
                        case NODE_TYPE_DOCUMENT:
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

            function nameNormalize(name) {
                return name.toLowerCase().replace(/-\w/g, function(str) {
                    return str.charAt(1).toUpperCase();
                })
            }
        }
    ]
}
