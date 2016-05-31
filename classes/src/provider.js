function ProviderCache() {
    var providerCache = {};
    this.getAll = function() {
        return providerCache;
    };
    this.getProviderByName = function(providerName) {
        return providerCache[providerName];
    };
    this.addProvider = function(providerName, factoryFunction) {
        if (isObject(providerName)) {
            for (var key in providerName) {
                providerCache[key] = providerName[key];
            }
            return this;
        }
        providerCache[providerName] = factoryFunction;
        return this;
    }
}

var providerCache = new ProviderCache();
providerCache.addProvider({
    $appCache: $AppCacheProvider,
    $ast: $AstProvider,
    $bootstrap: $BootstrapProvider,
    $compile: $CompilerProvider,
    $directive: $DirectiveProvider,
    $http: $HttpProvider,
    $lexer: $LexerProvider,
    $model: $ModelProvider,
    $parse: $ParseProvider,
    $promise: $PromiseProvider,
    $query: $QueryProvider,
    $registerApp: $AppProvider,
    $value: $ValueProvider,
    $xmlEngine: $XmlEngineProvider,
	$directive: $DirectiveProvider
})
