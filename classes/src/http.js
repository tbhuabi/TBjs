var $HttpProvider = function $HttpProvider() {
	if (!(this instanceof $HttpProvider)) return new $HttpProvider();
    this.$get = function() {
        return Http;
    };
	this.interceptors=[];

    var options = {
        common: "application/json, text/plain, */*",
        get: {
            method: 'get',
            requestHeaders: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            params: null,
            data: null,
            transformRequest: []
        },
        post: {
            method: 'post',
            requestHeaders: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        }
    };

	var config=function(){

	};


    function Http(data, options) {
        return new Http.prototype.init(data, options);
    }
    Http.prototype.init = function(data, options) {
    };
    Http.prototype.init.prototype = Http.prototype;
    extend(Http.prototype, {
        success: function(data) {

        },
        error: function() {

        },
		timeout: function(){

		}
    })
};
