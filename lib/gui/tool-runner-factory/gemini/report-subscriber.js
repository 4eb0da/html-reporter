'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const testStatuses = require('../../../constants/test-statuses');
const utils = require('../../../../utils');
const {findNode} = require('../../../../lib/static/modules/utils');

module.exports = (gemini, reportBuilder, client, pluginConfig) => {
    const proxy = (event) => {
        gemini.on(event, (...data) => {
            client.emit(event, ...data);
        });
    };

    proxy(gemini.events.BEGIN);

    gemini.on(gemini.events.BEGIN_SUITE, (data) => {
        const {name, path: suitePath} = data.suite;
        client.emit(gemini.events.BEGIN_SUITE, {
            name,
            suitePath,
            status: testStatuses.RUNNING
        });
    });

    gemini.on(gemini.events.BEGIN_STATE, (data) => {
        const {name, suite: {path: suitePath}} = data.state;
        client.emit(gemini.events.BEGIN_STATE, {
            name,
            suitePath,
            browserId: data.browserId,
            status: testStatuses.RUNNING
        });
    });

    gemini.on(gemini.events.TEST_RESULT, (data) => {
        data.equal
            ? reportBuilder.addSuccess(data)
            : reportBuilder.addFail(data);

        const {state: {name}, suite, browserId} = data;
        const suitePath = suite.path.concat(name);
        const test = {name, suitePath, browserId};
        const nodeResult = findNode(reportBuilder.getSuites(), suitePath);
        const browserResult = _.find(nodeResult.browsers, {name: browserId});

        saveTestImages(reportBuilder.format(data), pluginConfig.path)
            .then(() => client.emit(gemini.events.TEST_RESULT, Object.assign(test, {browserResult})));
    });

    proxy(gemini.events.SKIP_STATE);
    proxy(gemini.events.END_STATE);
    proxy(gemini.events.END_SUITE);
    proxy(gemini.events.END);
};

function saveTestImages(testResult, reportPath) {
    console.log('reportPath', reportPath);
    const actions = [
        utils.copyImageAsync(
            testResult.referencePath,
            utils.getReferenceAbsolutePath(testResult, reportPath)
        )
    ];

    if (!testResult.equal) {
        actions.push(
            utils.copyImageAsync(
                testResult.currentPath,
                utils.getCurrentAbsolutePath(testResult, reportPath)
            ),
            utils.saveDiff(
                testResult,
                utils.getDiffAbsolutePath(testResult, reportPath)
            )
        );
    }

    return Promise.all(actions);
}
