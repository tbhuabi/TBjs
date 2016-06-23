function $filterProvider() {
    var filterSuffix = 'Filter';
    var filterCache = {};

    this.$get = ['$injector',
        function($injector) {
            return {
                has: hasFilter,
                get: getFilter
            }

            function hasFilter(name) {
                return filterCache.hasOwnProperty(name) || $injector.has(name + filterSuffix);
            }

            function getFilter(name) {
                if (filterCache.hasOwnProperty(name)) {
                    return filterCache[name];
                }
                return filterCache[name] = $injector.get(name + filterSuffix);
            }
        }
    ];
}
