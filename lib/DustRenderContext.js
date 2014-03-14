var promiseUtil = require('raptor-promises/util');
var logger = require('raptor-logging').logger(module);

function ChunkWriter(dustChunk) {
    this._dustChunk = dustChunk;
}

ChunkWriter.prototype = {
    write: function(str) {
        this._dustChunk.write(str);
    }
};

function DustRenderContext(dustChunk, attributes) {
    var writer = new ChunkWriter(dustChunk);
    DustRenderContext.$super.call(this, writer, attributes);
    this._dustChunk = dustChunk;
}

DustRenderContext.prototype = {
    beginAsync: function(callback, timeout) {
        var _this = this;

        this._dustChunk = this._dustChunk.map(function(asyncChunk) {
            var asyncDustRenderContext = new DustRenderContext(asyncChunk, _this.attributes);
            function doneCallback(err, data) {
                if (err) {
                    logger.error('Async fragment failed. Exception: ' + err, err);
                }

                if (data) {
                    asyncDustRenderContext.write(data);
                }
                asyncDustRenderContext._dustChunk.end();
            }

            var promise = callback(asyncDustRenderContext, doneCallback);

            if (promise) {
                promiseUtil.immediateThen(
                    promise,
                    function (result) {
                        if (result != null) {
                            asyncDustRenderContext.write(result);
                        }
                        doneCallback();
                    },
                    function (e) {
                        doneCallback(e || 'Failed');
                    });
            }
        });
    },

    renderDustBody: function(body, context) {
        var newChunk = this._dustChunk.render(body, context);
        this._dustChunk = newChunk;
    }

};

require('raptor-util').inherit(DustRenderContext, require('raptor-render-context').Context);

module.exports = DustRenderContext;