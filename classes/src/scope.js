var $ScopeProvider = function $ScopeProvider() {

    if (!(this instanceof $ScopeProvider)) return new $ScopeProvider();

    this.$get = function() {
        return Scope;
    };

    function Scope(scopeName, callback) {
		return new Scope.prototype.$init(scopeName,callback)
    }
	Scope.prototype.$init=function(scopeName,callback){
        this.$scopeName = scopeName;
	};
	Scope.prototype.$init.prototype=Scope.prototype;
    extend(Scope.prototype, {
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
