var nodePath = require('path');
var fs = require('fs');
var DustRenderContext = require('./DustRenderContext');

function invokeRenderer(tag, chunk, context, bodies, params) {
    var attributes = context.global.raptorAttributes;
    if (!attributes) {
        context.global.raptorAttributes = attributes = {};
    }

    var renderContext = new DustRenderContext(chunk, attributes);
    var render = tag.render || tag.process;
    params = params || {};
    
    if (!render) {
        var proto = tag.prototype;
        if (proto) {
            render = proto.render || proto.process;
        }
        
    }
    render.call(tag, params, renderContext);
    return renderContext._dustChunk;
}

function configure(dust, config) {

    if (!config) {
        config = {};
    }

    var baseDir = config.baseDir || process.cwd();

    dust.onLoad = function(path, callback) {
        if (!path.endsWith('.dust')) {
            path += '.dust';
        }

        path = nodePath.join(baseDir, path);

        fs.readFile(path, 'UTF-8', callback);
    };

    dust.raptor = {
        baseDir: baseDir,
        resolvePath: function(path) {
            return nodePath.join(this.baseDir, path);
        },
        invokeRenderer: invokeRenderer
    };

    dust.helpers.component = function(chunk, context, bodies, params) {
        var renderer = params.renderer;
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                if (k === 'true') {
                    params[k] = true;
                }
                else if (k === 'false') {
                    params[k] = false;
                }
            }
        }
        return invokeRenderer(require(renderer), chunk, context, bodies, params);
    };

    require('./optimizer-helpers').addHelpers(dust);
    // require('./async-helpers').addHelpers(dust);
    // require('./widgets-helpers').addHelpers(dust);
}

exports.configure = configure;