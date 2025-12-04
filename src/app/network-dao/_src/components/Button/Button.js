/**
 * @file Button
 * @author zhouminghui
*/

import React, { PureComponent } from 'react';
import './Button.css';

export default class Button extends PureComponent {
  render() {
    return (
      <div className="AElf-button" onClick={this.props.click} style={this.props.style}>
        {this.props.title}
      </div>
    );
  }
}
