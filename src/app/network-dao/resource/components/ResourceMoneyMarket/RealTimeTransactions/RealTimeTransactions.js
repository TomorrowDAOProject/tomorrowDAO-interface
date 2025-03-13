/**
 * @file RealTimeTransactions
 * @author zhouminghui
 */

import React, { PureComponent } from "react";
import { Row, Col } from "antd";
import moment from "moment";
import { connect } from "react-redux";

// import { Link } from "react-router-dom";
import Link from "next/link";
import {
  SYMBOL,
  ELF_DECIMAL,
  ELF_PRECISION,
  REAL_TIME_FETCH_INTERVAL,
  RESOURCE_REALTIME_RECORDS,
} from "@src/constants";
import { thousandsCommaWithDecimal } from "@utils/formater";
import "./RealTimeTransactions.css";
import { mainExplorer } from "config";
import { apiServer } from "api/axios";

const fetchLimit = 20;
const displayLimit = 5;
class RealTimeTransactions extends PureComponent {
  constructor(props) {
    super(props);
    this.getResourceRealtimeRecordsTimer = null;
    this.state = {
      recordsData: null,
    };
  }

  componentDidMount() {
    this._mounted = true;
    this.getResourceRealtimeRecords();
    window.addEventListener('resize', this.update)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.type !== this.props.type) {
      clearTimeout(this.getResourceRealtimeRecordsTimer);
      this.getResourceRealtimeRecords();
    }
  }

  getTableHeadHTML() {
    return (
      <Row className="table-head" type="flex" align="middle">
        <Col span={6} offset={6}>
          Average price(
          {SYMBOL})
        </Col>
        <Col span={6}>Number</Col>
        <Col span={6}>Cumulative</Col>
      </Row>
    );
  }
  update = () => {
    this.forceUpdate()
  }

  async getResourceRealtimeRecords() {
    const { type } = this.props;
    try {
      const res = await apiServer.get(RESOURCE_REALTIME_RECORDS, {
        limit: fetchLimit,
        type,
      });
      const data = res?.data
      // todo: move the logic to backend
      // todo: repeating code
      data.buyRecords = data.buyRecords
        .sort((a, b) => moment(b.time).unix() - moment(a.time).unix())
        .slice(0, displayLimit);
      data.soldRecords = data.soldRecords
        .sort((a, b) => moment(b.time).unix() - moment(a.time).unix())
        .slice(0, displayLimit);

      this.setState({
        recordsData: data || [],
      });
      this.props.getRealTimeTransactionLoading();
      if (!this._mounted) return;
      this.getResourceRealtimeRecordsTimer = setTimeout(() => {
        this.getResourceRealtimeRecords();
      }, REAL_TIME_FETCH_INTERVAL);
    } catch (error) {
      if (!this._mounted) return;
      this.getResourceRealtimeRecordsTimer = setTimeout(() => {
        this.getResourceRealtimeRecords();
      }, REAL_TIME_FETCH_INTERVAL);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    clearTimeout(this.getResourceRealtimeRecordsTimer);
    window.removeEventListener('resize', this.update)
  }

  // eslint-disable-next-line consistent-return
  getSellInfoHTML() {
    console.log('recordsData', this.state)

    const { recordsData } = this.state;
    let data = null;
    if (recordsData) {
      data = recordsData.soldRecords || [];
      return data.map((item, index) => {
        const date = this.formatDate(item.time);
        let { resource = 0, elf = 0, fee = 0 } = item;
        resource /= ELF_DECIMAL;
        elf /= ELF_DECIMAL;
        fee /= ELF_DECIMAL;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Row className="table-sell" type="flex" align="middle" key={index}>
            <Col span={4}>
              <Link href={`${mainExplorer}/tx/${item.tx_id}`}>{date}</Link>
            </Col>
            <Col span={3} className="sell">
            <div className="sell-tag tag">
              Sell
            </div>
            </Col>
            <Col span={5}>{(elf / resource).toFixed(ELF_PRECISION)}</Col>
            <Col span={6}>{thousandsCommaWithDecimal(resource)}</Col>
            <Col span={6}>{thousandsCommaWithDecimal(elf - fee)}</Col>
          </Row>
        );
      });
    }
  }

  // todo: Move to utils or redesign the mobile view
  formatDate(date) {
    const isSmallScreen = document.body.offsetWidth < 768;

    const format = isSmallScreen ? "HH:mm:ss" : "HH:mm:ss.SSS";
    return moment(date).format(format);
  }

  // todo: decrease the repeating code
  // eslint-disable-next-line consistent-return
  getBuyInfoHTML() {
    const { recordsData } = this.state;

    let data = null;
    if (recordsData) {
      data = recordsData.buyRecords || [];
      return data.map((item, index) => {
        const date = this.formatDate(item.time);
        let { resource = 0, elf = 0, fee = 0 } = item;
        resource /= ELF_DECIMAL;
        elf /= ELF_DECIMAL;
        fee /= ELF_DECIMAL;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Row className="table-buy" type="flex" align="middle" key={index}>
            <Col span={4}>
              <Link href={`${mainExplorer}/tx/${item.tx_id}`}>{date}</Link>
            </Col>
            <Col span={3} className="sell">
            <div className="buy-tag tag">
              Buy
            </div>
            </Col>
            <Col span={5}>{(elf / resource).toFixed(ELF_PRECISION)}</Col>
            <Col span={6}>{thousandsCommaWithDecimal(resource)}</Col>
            <Col span={6}>{thousandsCommaWithDecimal(elf + fee)}</Col>
          </Row>
        );
      });
    }
  }

  render() {
    const tableHead = this.getTableHeadHTML();
    const sellInfo = this.getSellInfoHTML();
    const buyInfo = this.getBuyInfoHTML();
    return (
      <div className="real-time-transactions my-[40px]">
        <div className="mb-[20px]">
          <div className="text-white text-[12px] font-Montserrat font-medium">
            Real Time Transactions
          </div>
        </div>
        <div className="real-time-transactions-body">
          {tableHead}
          {sellInfo}
          {buyInfo}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state.common,
});

export default connect(mapStateToProps)(RealTimeTransactions);
