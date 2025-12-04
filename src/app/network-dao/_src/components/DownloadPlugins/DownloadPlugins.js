/**
 * @file
 * @author zhouminghui yangpeiyang
 */

import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
// import Button from '../Button/Button';
import './DownloadPlugins.css';

export default class DownloadPlugins extends PureComponent {
  getDownload() {
  }

  render() {
    const { style } = this.props;
    return (
      <div className="DownloadPlugins" style={style}>
        <div className="Tips">
          Please download and install NightElf browser extension.
          Please don’t forget to refresh the page : )
        </div>
        <div className="step">
          <Row>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div className="Step-con">
                1.Install the extension
                <a className="download-button" target="_blank" href="https://chrome.google.com/webstore/search/AELF" rel="noreferrer">download</a>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div className="Step-con">2.Create a common wallet</div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div className="Step-con">3.Try to vote!</div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
