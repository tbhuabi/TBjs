var $DirectiveProvider = function $DirectiveProvider() {

    this.$get = function() {
        return directive;
    };

    function Directive() {
        this.directives = {};
    }

    extend(Directive.prototype, {
        directive: function(directiveName, callback) {
            this.directives[directiveName] = callback;
        }
    })

    var directive = new Directive();
    directive.directive('vmClick', function() {
        return function(model, element, attrs) {
            element.on('click', function() {
                model.$parse(attrs.vmClick);
                model.$apply();
            })
        }
    })
}
