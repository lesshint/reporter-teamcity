'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const sinon = require('sinon');
const util = require('util');

const reporter = proxyquire('./index', {util: util});

describe('reporter:teamcity', () => {
    beforeEach(() => {
        sinon.stub(process.stdout, 'write');
    });

    afterEach(() => {
        if (process.stdout.write.restore) {
            process.stdout.write.restore();
        }
    });

    it('should not print anything when not passed any errors', () => {
        const errors = [];

        sinon.spy(console, 'log');

        reporter.report(errors);

        expect(console.log.called).to.equal(true);
        expect(console.log.getCall(0).args[0]).to.equal('##teamcity[testSuiteStarted name=\'lesshint\']');
        expect(console.log.getCall(1).args[0]).to.equal('##teamcity[testStarted name=\'lesshint\']');
        expect(console.log.getCall(2).args[0]).to.equal('##teamcity[testFinished name=\'lesshint\']');
        expect(console.log.getCall(3).args[0]).to.equal('##teamcity[testSuiteFinished name=\'lesshint\']');

        console.log.restore();
    });

    it('print error for 1 file', () => {
        const errors = [{
            column: 5,
            file: 'file.less',
            fullPath: 'path/to/file.less',
            line: 1,
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            severity: 'error',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');
        sinon.spy(util, 'format');

        reporter.report(errors);

        expect(console.log.called).to.equal(true);
        expect(util.format.called).to.equal(true);
        expect(console.log.getCall(1).args[0]).to.equal('##teamcity[testStarted name=\'path/to/file.less\']');
        expect(console.log.getCall(2).args[0]).to.equal(
            '##teamcity[testFailed name=\'path/to/file.less\' message=\'line 1, col 5,'
            + ' Error (spaceBeforeBrace) Opening curly brace should be preceded by one space.\']'
        );

        console.log.restore();
    });

    it('print errors for 2 files', () => {
        const errors = [{
            column: 5,
            file: 'file.less',
            fullPath: 'path/to/file.less',
            line: 1,
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            severity: 'error',
            source: '.foo{ color: red; }'
        }, {
            column: 5,
            file: 'file.less',
            fullPath: 'path/to/file.less',
            line: 1,
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            severity: 'warning',
            source: '.foo{ color: red; }'
        }, {
            column: 5,
            file: 'file.less',
            fullPath: 'path/to/another/file.less',
            line: 1,
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            severity: 'warning',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');

        reporter.report(errors);

        expect(console.log.called).to.equal(true);
        expect(util.format.called).to.equal(true);
        expect(console.log.getCall(1).args[0]).to.equal('##teamcity[testStarted name=\'path/to/file.less\']');
        expect(console.log.getCall(2).args[0]).to.equal(
            '##teamcity[testFailed name=\'path/to/file.less\' message=\'line 1, col 5,'
            + ' Error (spaceBeforeBrace) Opening curly brace should be preceded by one space.\']'
        );
        expect(console.log.getCall(6).args[0]).to.equal(
            '##teamcity[testFailed name=\'path/to/another/file.less\' message=\'line 1, col 5,'
            + ' Warning (spaceBeforeBrace) Opening curly brace should be preceded by one space.\']'
        );

        console.log.restore();
    });
});
