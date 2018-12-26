'use strict';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LazyLoad from '@gemini-testing/react-lazyload';
import {keyframes} from 'styled-components';
import Placeholder from './placeholder';

class Screenshot extends Component {
    static propTypes = {
        noCache: PropTypes.bool,
        image: PropTypes.shape({
            path: PropTypes.string.isRequired,
            size: PropTypes.shape({
                width: PropTypes.number,
                height: PropTypes.number
            }),
            diffBounds: PropTypes.shape({
                left: PropTypes.number,
                top: PropTypes.number,
                right: PropTypes.number,
                bottom: PropTypes.number
            })
        }).isRequired,
        lazyLoadOffset: PropTypes.number
    }

    static defaultProps = {
        noCache: false
    }

    _clickEffect(x, y, {diffBounds: {top, right, bottom, left}, widthCoeff, heightCoeff}) {
        var d = document.createElement('div');
        d.className = 'clickEffect';
        d.style.top = `${y}px`;
        d.style.left = `${x}px`;

        const a = widthCoeff * (bottom - top);
        const b = heightCoeff * (right - left);
        const minSize = Math.sqrt(a * a + b * b);
        // console.log('SIZE');
        const radius = minSize * 0.1 + 150;
        // console.log(minSize);
        // const maxSize = Math.max(bottom - top, right - left);
        // console.log(radius);
        // console.log(maxSize);
        const animation = keyframes`
            0% {
                opacity: 1;
                width: ${minSize}px;
                height: ${minSize}px;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 7px 0px #ff00ff;
            }

            100% {
                opacity: 0.4;
                width: ${minSize + radius}px;
                height: ${minSize + radius}px;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 25px 0px #ff00ff;
            }
        `;
        d.style.animation = `${animation} 1s ease-out`;
        // console.log('HER');
        // console.log(d);
        document.body.appendChild(d);
        d.addEventListener('animationend', (() => {
            d.parentElement.removeChild(d);
        }).bind(this));
    }

    _handle = (diffBounds) => (e) => {
        if (!diffBounds) {
            return;
        }

        const targetRect = e.target.getBoundingClientRect();
        // console.log('>>>>>.');
        // console.log(e.target);
        // console.log(e.target.naturalWidth, e.target.width);
        // console.log(targetRect);
        // console.log(diffBounds);
        // console.log((diffBounds.right - diffBounds.left) / 2, (diffBounds.bottom - diffBounds.top) / 2);
        // console.log(e.clientX, e.clientY);

        const widthCoeff = e.target.width / e.target.naturalWidth;
        const heightCoeff = e.target.height / e.target.naturalHeight;
        // console.log('@@@@');
        // console.log(
        //     targetRect.left + widthCoeff * (diffBounds.left + ((diffBounds.right - diffBounds.left) / 2)),
        //     targetRect.top + heightCoeff * (diffBounds.top + ((diffBounds.bottom - diffBounds.top) / 2))
        // );
        // console.log(widthCoeff, heightCoeff);
        this._clickEffect(
            targetRect.left + widthCoeff * (diffBounds.left + ((diffBounds.right - diffBounds.left) / 2)),
            targetRect.top + heightCoeff * (diffBounds.top + ((diffBounds.bottom - diffBounds.top) / 2)),
            {diffBounds, widthCoeff, heightCoeff}
        );
    };

    render() {
        const {noCache, image: {path: imgPath, size: imgSize, diffBounds}, lazyLoadOffset: offset} = this.props;
        // console.log('RENDER$');
        // console.log(diffBounds);

        const url = noCache
            ? addTimestamp(encodeUri(imgPath))
            : encodeUri(imgPath);

        if (!imgSize) {
            const elem = <img src={url} className="image-box__screenshot" />;

            return offset ? <LazyLoad offsetVertical={offset} once>{elem}</LazyLoad> : elem;
        }

        const elem = <img onClick={this._handle(diffBounds)} src={url} width={imgSize.width} height={imgSize.height} className="image-box__screenshot" />;

        const paddingTop = ((imgSize.height / imgSize.width) * 100).toFixed(2);
        const placeholder = <Placeholder width={imgSize.width} paddingTop={`${paddingTop}%`} />;

        return <LazyLoad offsetVertical={offset} debounce={50} placeholder={placeholder} once>{elem}</LazyLoad>;
    }
}

function encodeUri(imagePath) {
    return imagePath
        .split('/')
        .map((item) => encodeURIComponent(item))
        .join('/');
}

// for prevent image caching
function addTimestamp(imagePath) {
    return `${imagePath}?t=${Date.now()}`;
}

export default connect(({view: {lazyLoadOffset}}) => ({lazyLoadOffset}))(Screenshot);
