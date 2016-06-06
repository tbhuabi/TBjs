function Module(app, obj, model) {
    var self = this;
    self.app = app;
    obj = obj || {};
    var Model = obj.model || noop;
    Model.prototype = model;
    self.model = new Model();

    if (obj.template) {
        if (isString(obj.template)) {
            self.element = new VirtualDom(obj.template);
			self.build();
        } else {
//            self.element = new VirtualDom('');
//            createDomMap(obj.template, self.element, self.element);
			self.element=obj.template;
			self.build();
        }
    } else if (obj.templateUrl) {
        http({
            url: obj.templateUrl
        }).then(function(response) {
            self.element = new VirtualDom(response);
			self.build();
        })
    }
}
extend(Module.prototype, {
    build: function() {
		compiler(this);
    }
})

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
};
