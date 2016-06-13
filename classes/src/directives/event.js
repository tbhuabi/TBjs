var tbEventDirectives = {};

forEach('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '), function(eventType) {
    var event = 'tb' + eventType.replace(/^\w/, function(str) {
        return str.toUpperCase();
    });
    tbEventDirectives[event] = ['$parse', function($parse) {
        return {
            restrict: 'EA',
            priority: '>',
//            terminal: false,
            controller: function(model, vDomElement, attrs) {
                vDomElement.on(eventType, function() {
					alert(2222)
                    //$parse(attrs[event])(model);
                })
            }
        }
    }]
})
