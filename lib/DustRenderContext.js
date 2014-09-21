var Context = require('async-writer').AsyncWriter;

function ChunkWriter(dustRenderContext) {
    this._dustRenderContext = dustRenderContext;
}

ChunkWriter.prototype = {
    write: function(str) {
        this._dustRenderContext._dustChunk.write(str);
    }
};

var Context_end = Context.prototype.end;

function DustRenderContext(dustChunk, dustContext, attributes, async) {
    var writer = new ChunkWriter(this);
    DustRenderContext.$super.call(this, writer, attributes);
    this._dustChunk = dustChunk;
    this.dustContext = dustContext;
    this._dustAsync = async === true;
}

DustRenderContext.prototype = {
    featureLastFlush: false,
    getAttribute: function(name) {
        return this.attributes[name] || this.dustContext.get(name);
    },

    beginAsync: function(options) {
        var attributes = this.attributes;
        var asyncDustRenderContext;
        var dustContext = this.dustContext;

        this._dustChunk = this._dustChunk.map(function(asyncDustChunk) {
            asyncDustRenderContext = new DustRenderContext(asyncDustChunk, dustContext, attributes, true /* async */);
        });

        asyncDustRenderContext.handleBeginAsync(options);

        return asyncDustRenderContext;
    },

    end: function(data) {
        if (data) {
            this.write(data);
        }

        if (this._dustAsync) {
            this._dustChunk.end();
            this.handleEnd(true);
        } else {
            this.handleEnd(false);
        }

        return this;
    },

    renderDustBody: function(body, context) {
        this._dustChunk = this._dustChunk.render(body, context || this.dustContext);
    }

};

require('raptor-util').inherit(DustRenderContext, Context);

module.exports = DustRenderContext;