import React, { Component } from 'react';
// import isEmpty from "lodash/isEmpty";
import { get } from '../../utils';
import { ELF_REALTIME_PRICE_URL } from '../../constants';

import './tradecards.style.css';

export default class TradeCards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      price: {
        USD: '-',
        CNY: '-',
        BTC: '-',
      },
      tick: {
        vol: 0,
        open: 0,
        close: 0,
        count: 0,
        low: 0,
        high: 0,
      },
    };
  }

  async componentDidMount() {
    const price = await get(ELF_REALTIME_PRICE_URL, { fsym: 'ELF', tsyms: "USD,BTC,CNY" });
    try {
      //   const detail = await get("/market/detail", {
      //     symbol: "elfbtc"
      //   });
      //   const tick = isEmpty(detail) ? { vol: 0 } : detail.tick;

      this.setState({
        price,
        // tick
      });
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { price } = this.state;
    return (
      <div className="tradecards-container">
        <div className="tradecard">
          <h2 />
          <ul className="card-left">
            <li className="card-left-title">
              ￥
              {price.CNY}
            </li>
            <li className="card-left-desc">
              <span>
                ≈$
                {price.USD}
              </span>
              <span>
                ≈
                {price.BTC}
                BTC
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
