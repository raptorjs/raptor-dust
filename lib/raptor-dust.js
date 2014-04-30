var nodePath = require('path');
var fs = require('fs');
var DustRenderContext = require('./DustRenderContext');

function invokeRenderer(renderFunc, chunk, context, bodies, params, buildInput) {
    var attributes = context.global.raptorAttributes;
    if (!attributes) {
        context.global.raptorAttributes = attributes = {};
    }

    var renderContext = new DustRenderContext(chunk, attributes);

    params = params || {};

    if (buildInput) {
        params = buildInput(chunk, context, bodies, params, renderContext);
    } else {
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
    }

    renderFunc(params, renderContext);
    return renderContext._dustChunk;
}

function dustHelperFromRenderer(renderer) {
    var renderFunc;
    var buildInput;

    if (typeof renderer === 'function') {
        renderFunc = renderer;
    } else {
        renderFunc = renderer.render || renderer.process;
        buildInput = renderer.buildInput;
    }

    if (typeof renderFunc !== 'function') {
        throw new Error('Invalid renderer: ' + renderer);
    }

    return function(chunk, context, bodies, params) {
        return invokeRenderer(renderFunc, chunk, context, bodies, params, buildInput);
    };
}

function registerHelper(name, renderer, dust) {
    if (!dust) {
        dust = require('dustjs-linkedin');
    }

    dust.helpers[name] = dustHelperFromRenderer(renderer);
}

function registerHelpers(tags, dust) {
    if (!dust) {
        dust = require('dustjs-linkedin');
    }

    for (var tagName in tags) {
        if (tags.hasOwnProperty(tagName)) {
            registerHelper(tagName, tags[tagName], dust);
        }
    }
}

exports.invokeRenderer = invokeRenderer;
exports.registerHelper = registerHelper;
exports.registerHelpers = registerHelpers;