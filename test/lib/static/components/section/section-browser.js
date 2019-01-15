import React from 'react';
import SectionBrowser from 'lib/static/components/section/section-browser';
import {mkConnectedComponent, mkTestResult_, mkImg_} from '../utils';
import {mkSuite, mkBrowserResult} from '../../../../utils';

const browserName = 'chrome-phone';
const skipReason = 'stub reason';
const skipStatus = 'skipped';

const errorStub = {
    message: 'messageStub',
    stack: 'stackStub'
};

const browserRetriesStub = [
    mkTestResult_({
        error: errorStub,
        status: 'error'
    })
];

function createImagesInfoStub(status) {
    return [
        {
            status,
            error: errorStub,
            actualImg: mkImg_()
        }
    ];
}

function mkSectionBrowserComponent({name, retries = [], skipReason, status = '', initialState, imagesInfo, error}) {
    const browser = mkBrowserResult({
        name,
        result: mkTestResult_({
            skipReason,
            status,
            imagesInfo,
            error
        }),
        retries
    });

    const suite = mkSuite({
        browsers: [browser],
        status
    });

    return mkConnectedComponent(
        <SectionBrowser browser={browser} suite={suite} />,
        {initialState}
    );
}

describe('<SectionBrowser/>', () => {
    it('should show "[skipped]" tag in title for skipped test', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            status: skipStatus
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 0);
        assert.lengthOf(component.find('.section__body'), 0);
    });

    it('should show reason for skipped test', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            skipReason,
            status: skipStatus
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}, reason: ${skipReason}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 0);
        assert.lengthOf(component.find('.section__body'), 0);
    });

    it('should show button "view in browser" for muted test', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            retries: browserRetriesStub,
            status: skipStatus
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 1);
        assert.lengthOf(component.find('.section__body'), 0);
    });

    it('should show reason for muted test', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            skipReason,
            retries: browserRetriesStub,
            status: skipStatus
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}, reason: ${skipReason}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 1);
        assert.lengthOf(component.find('.section__body'), 0);
    });

    it('should show body for muted test', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            skipReason,
            retries: browserRetriesStub,
            status: skipStatus,
            initialState: {view: {expand: 'all'}}
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}, reason: ${skipReason}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 1);
        assert.lengthOf(component.find('.section__body'), 1);
    });

    it('should show body for muted test with imagesInfo but without retry', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            skipReason,
            status: skipStatus,
            imagesInfo: createImagesInfoStub(skipStatus),
            initialState: {view: {expand: 'all'}}
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}, reason: ${skipReason}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 1);
        assert.lengthOf(component.find('.section__body'), 1);
    });

    it('should show body for muted test with error but without retry', () => {
        const component = mkSectionBrowserComponent({
            name: browserName,
            skipReason,
            status: skipStatus,
            error: errorStub,
            initialState: {view: {expand: 'all'}}
        });

        assert.equal(
            component
                .find('.section__title')
                .first()
                .text(),
            `[${skipStatus}] ${browserName}, reason: ${skipReason}`
        );
        assert.lengthOf(component.find('[title="view in browser"]'), 1);
        assert.lengthOf(component.find('.section__body'), 1);
    });
});
