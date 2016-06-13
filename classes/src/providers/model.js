function $ModelProvider() {
    this.$get = function() {
        return Model;
    };
    function Model(scopeName, callback) {}
    extend(Model.prototype, {
        $new: function(scopeName, obj) {
            function a() {}
            a.prototype = this;
            var newModule = new a();
            this.$init.call(newModule, scopeName, obj);
            return newModule;
        },
        $apply: function() {

        }
    })
};
