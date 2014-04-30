'use strict';
var chai = require('chai');
chai.Assertion.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var fs = require('fs');

var dust = require('dustjs-linkedin');

dust.onLoad = function(path, callback) {
    if (!fs.existsSync(path)) {
        if (!path.endsWith('.dust')) {
            path += '.dust';
        }
    }

    fs.readFile(path, 'utf-8', callback);
};

var raptorDust = require('../');
raptorDust.registerHelper('app-hello', require('./components/app-hello/renderer'));

describe('raptor-dust' , function() {

    beforeEach(function(done) {
        // for (var k in require.cache) {
        //     if (require.cache.hasOwnProperty(k)) {
        //         delete require.cache[k];
        //     }
        // }

        done();
    });

    it('should allow a simple custom tag to be rendered', function(done) {
        dust.render(require.resolve('./pages/app-tags.dust'), {}, function(err, output) {
            if (err) {
                return done(err);
            }

            expect(output).to.equal('app-hello: Hello Frank');
            done();
        });
    });

});