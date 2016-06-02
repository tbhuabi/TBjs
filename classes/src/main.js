/**
 * 向全局抛出TBjs
 * @param   {window|global} global 全局对象
 * @returns {function} app方法
 */
function init(global) {
    var tbMinErr = minErr('TB');

    function ensure(obj, name, factory) {
        return obj[name] || (obj[name] = factory())
    }

    var TBjs = ensure(global, 'TBjs', Object);
    var appFactory = ensure(TBjs, 'app', function() {
        var applications = {};
        return function app(appName, requires) {

            return ensure(applications, appName, function() {
                return {
					requires:requires,
                    directive: function(){
						console.log(applications);
						console.log(TBjs)
					},
                    provider: '',
                    module: ''
                }
            })
        }
    });
    var rootApplication = appFactory('TB', []);
    rootApplication.directive('')
}
init(window);
