function $AppCacheProvider() {
    var applications = {};
    this.$get = function() {
        return applications;
    };
    this.get = function(key) {
        return applications[key];
    };
    this.set = function(key, app) {
        applications[key] = app;
    }
}
