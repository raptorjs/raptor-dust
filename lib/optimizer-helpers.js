var pageTag = require('raptor-optimizer/taglib/page-tag');
var slotTag = require('raptor-optimizer/taglib/slot-tag');
var headTag = require('raptor-optimizer/taglib/head-tag');
var bodyTag = require('raptor-optimizer/taglib/body-tag');
var nodePath = require('path');

exports.addHelpers = function(dust) {
    

    dust.helpers.optimizerPage = function(chunk, context, bodies, params) {
        var templateName = context.getTemplateName();
        var templatePath = dust.raptor.resolvePath(templateName);
        var dirname = nodePath.dirname(templatePath);
        params.dirname = dirname;

        if (params.packagePath) {
            params.packagePath = nodePath.resolve(dirname, params.packagePath);
        }

        return dust.raptor.invokeRenderer(pageTag, chunk, context, bodies, params);
    };

    dust.helpers.optimizerSlot = function(chunk, context, bodies, params) {
        return dust.raptor.invokeRenderer(slotTag, chunk, context, bodies, params);
    };

    dust.helpers.optimizerHead = function(chunk, context, bodies, params) {
        return dust.raptor.invokeRenderer(headTag, chunk, context, bodies, params);
    };

    dust.helpers.optimizerBody = function(chunk, context, bodies, params) {
        return dust.raptor.invokeRenderer(bodyTag, chunk, context, bodies, params);
    };
};