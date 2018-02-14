'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {uniqueId} from 'lodash';
import SectionCommon from './section/section-common';
import {bindActionCreators} from 'redux';
import {initial, suiteBegin, testBegin, testResult} from '../modules/actions';

class Suites extends Component {
    static propTypes = {
        viewMode: PropTypes.string.isRequired,
        skips: PropTypes.array
    }

    componentDidMount() {
        if (this.props.gui) {
            this.props.actions.initial();
            this._subscribeToEvents();
        }
    }

    _subscribeToEvents() {
        const eventSource = new EventSource('/events');
        eventSource.addEventListener('beginSuite', (e) => {
            const data = JSON.parse(e.data);
            this.props.actions.suiteBegin(data);
        });

        eventSource.addEventListener('beginState', (e) => {
            const data = JSON.parse(e.data);
            this.props.actions.testBegin(data);
        });

        eventSource.addEventListener('testResult', (e) => {
            const data = JSON.parse(e.data);
            this.props.actions.testResult(data);
        });

        eventSource.onerror = () => {
            console.error('Seems like servers went down. Closing connection...');
            eventSource.close();
        };
    }

    render() {
        const {suites, viewMode} = this.props;

        return (
            <div className="sections">
                {suites[viewMode].map((suite) => {
                    const key = uniqueId(`${suite.suitePath}-${suite.name}`);
                    return <SectionCommon key={key} suite={suite}/>;
                })}
            </div>
        );
    }
}

const actions = {initial, testBegin, suiteBegin, testResult};

export default connect(
    (state) => ({
        viewMode: state.view.viewMode,
        suites: state.suites,
        gui: state.gui
    }),
    (dispatch) => ({actions: bindActionCreators(actions, dispatch)})
)(Suites);
