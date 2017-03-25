'use strict';

const util = require('util');

module.exports = {
    report: function report (results) {
        let lastFile = '';

        console.log('##teamcity[testSuiteStarted name=\'lesshint\']');

        results.forEach((result) => {
            const errFile = result.fullPath.replace(process.env.PWD + '/', '');

            if (lastFile !== errFile) {
                if (lastFile) {
                    console.log(util.format('##teamcity[testFinished name=\'%s\']', lastFile));
                }

                lastFile = errFile;
                console.log(util.format('##teamcity[testStarted name=\'%s\']', lastFile));
            }

            console.log(
                util.format(
                    '##teamcity[testFailed name=\'%s\' message=\'line %d, col %d, %s (%s) %s\']',
                    lastFile,
                    result.line,
                    result.column,
                    result.severity === 'error' ? 'Error' : 'Warning',
                    result.linter,
                    result.message.replace('\'', '|\'')
                )
            );
        });

        if (results.length) {
            console.log(util.format('##teamcity[testFinished name=\'%s\']', lastFile));
        } else {
            console.log('##teamcity[testStarted name=\'lesshint\']');
            console.log('##teamcity[testFinished name=\'lesshint\']');
        }

        console.log('##teamcity[testSuiteFinished name=\'lesshint\']');
    }
};
