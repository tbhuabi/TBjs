//    var vDom = new VirtualDom('');
//    vDom.$targetElement = element;
//    createDomMap(element, vDom, vDom);
function compiler(module) {
    var compilerErr = minErr('compiler');

    function transferDirectiveName(str) {
        return str.replace(/-\w/g, function(str) {
            return str.charAt(1).toUpperCase();
        })
    }

    function compileAttr(vDom, model) {
        var invokeQueue = [];
        forEach(vDom.attributes, function(item) {
            var value = item.value;
            var directiveName = transferDirectiveName(item.name);
            var directive = app.directive[directiveName + 'Directive'];
            if (directive) {
                invokeQueue.push({
                    key: directiveName,
                    fn: directive.controller
                })
            }
        })
        invokeQueue.sort(function(n, m) {
            return directivePriority.indexOf(n.key) > directivePriority.indexOf(m.key);
        })
        invokeQueue.forEach(function(item) {
            if (isFunction(item.fn)) {
                item.fn(model, Query(vDom));
            }
        })
    }

    function compilerText(vDom, model) {

    }

    var vDom = module.element;
    var app = module.app;
    var model = module.model;

    var doCompile = function(vDom, model) {
        if (vDom.nodeType === ELEMENT_NODE_TYPE) {
            compileAttr(vDom, model);
            if (vDom.childNodes) {
                forEach(vDom.childNodes, function(item) {
                    doCompile(item, model);
                })
            }
        } else if (vDom.nodeType === DOCUMENT_NODE_TYPE) {
            forEach(vDom.childNodes, function(item) {
                doCompile(item, model);
            })
        } else if (vDom.nodeType === TEXT_NODE_TYPE) {
            compilerText(vDom, model);
        }
    };
    doCompile(vDom, model);
}
