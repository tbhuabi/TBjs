//    var vDom = new VirtualDom('');
//    vDom.$targetElement = element;
//    createDomMap(element, vDom, vDom);
function compiler(module) {

    function compileAttr(vDom, model) {
        forEach(vDom.attributes, function(item) {
            var directiveName = transferDirectiveName(item.name);
            if (app.directive[directiveName]) {
                app.directive[directiveName](model, vDom);
            }
        })
    }

    function compilerText(vDom, model) {

    }
    console.log(module)

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
