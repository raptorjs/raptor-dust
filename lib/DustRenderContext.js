var Context = require('raptor-render-context').Context;

function ChunkWriter(dustChunk) {
    this._dustChunk = dustChunk;
}

ChunkWriter.prototype = {
    write: function(str) {
        this._dustChunk.write(str);
    }
};

var Context_end = Context.prototype.end;

function DustRenderContext(dustChunk, attributes, async) {
    var writer = new ChunkWriter(dustChunk);
    DustRenderContext.$super.call(this, writer, attributes);
    this._dustChunk = dustChunk;
    this._dustAsync = async === true;
}

DustRenderContext.prototype = {
    beginAsync: function(timeout) {
        var attributes = this.attributes;
        var asyncDustRenderContext;

        this._dustChunk = this._dustChunk.map(function(asyncChunk) {
            asyncDustRenderContext = new DustRenderContext(asyncChunk, attributes, true /* async */);
        });

        return asyncDustRenderContext;
    },

    end: function(data) {
        if (data) {
            this.write(data);
        }

        if (this._dustAsync) {
            this._dustChunk.end();
        }

        return Context_end.call(this);
    },

    error: function(e) {
        if (this._dustAsync) {
            this._dustChunk.end();
        }
        this.emit('error', e);
        
    },

    renderDustBody: function(body, context) {
        var newChunk = this._dustChunk.render(body, context);
        this._dustChunk = newChunk;
    }

};

require('raptor-util').inherit(DustRenderContext, Context);

module.exports = DustRenderContext;