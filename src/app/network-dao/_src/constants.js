/**
 * @file Home.js
 * @author longyue, huangzongzhe, yangpeiyang
 */
import React from "react";
import Link from 'next/link';
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// { DEFAUTRPCSERVER, SYMBOL, CHAIN_ID }
import config from "./config/config";
import addressFormat from "./utils/addressFormat";
// eslint-disable-next-line import/no-cycle
import { removeAElfPrefix } from "./utils/utils";
// eslint-disable-next-line import/no-cycle
import Dividends from "./components/Dividends";
import { mainExplorer } from "config";
const { SYMBOL, CHAIN_ID } = config;
dayjs.extend(relativeTime);

const ALL_BLOCKS_API_URL = "/all/blocks";
const ALL_UNCONFIRMED_BLOCKS_API_URL = "/all/unconfirmedBlocks";
const ALL_BLOCKS_UNCONFIRMED_BLOCKS_API_URL = "/all/block";
const ALL_TXS_API_URL = "/all/transactions";
const ALL_UNCONFIRMED_TXS_API_URL = "/all/unconfirmedTransactions";
const TXS_BLOCK_API_URL = "/block/transactions";
const ALL_TXS_UNCONFIRMED_TXS_API_URL = "/all/transaction";

export const TXS_INFO_API_URL = "/block/txInfo";
export const BLOCK_INFO_API_URL = "/block/blockInfo";
const ADDRESS_TXS_API_URL = "/address/transactions";
const ADDRESS_BALANCE_API_URL = "/api/address/balance";
const VIEWER_GET_ALL_TOKENS = "/viewer/getAllTokens";
const TPS_LIST_API_URL = "/tps/all";
const ADDRESS_TOKENS_API_URL = "/address/tokens";
const ELF_REALTIME_PRICE_URL = "/token/price";
const HISTORY_PRICE = "/token/price-history";
const ELF_REST_TRADE_API = "https://www.bcex.top/Api_Market/getCoinTrade";
const RESOURCE_REALTIME_RECORDS = "/resource/realtime-records";
const RESOURCE_TURNOVER = "/resource/turnover";
const RESOURCE_RECORDS = "/resource/records";
const SOCKET_URL = "/socket";
const SOCKET_URL_NEW = "https://explorer-test.aelf.io/new-socket";
const BASIC_INFO = "/chain-info";

const LOWER_SYMBOL = SYMBOL.toLocaleLowerCase();
const PAGE_SIZE = 25;
// todo: remove ELF_DECIMAL
const ELF_DECIMAL = 100000000;
const ELF_PRECISION = `${ELF_DECIMAL}`.length - 1;
const GENERAL_PRECISION = 2;
const RESOURCE_OPERATE_LIMIT = 0.01;
const TEMP_RESOURCE_DECIMAL = 100000;
const REAL_TIME_FETCH_INTERVAL = 1000 * 10;
const RESOURCE_CURRENCY_CHART_FETCH_INTERVAL = 1000 * 60;
const LONG_NOTIFI_TIME = 10; // s
// todo: use the code as follows
const TXSSTATUS = {
  NotExisted: "NotExisted",
  Pending: "Pending",
  Failed: "Failed",
  Mined: "Mined",
};

const txStatusInUpperCase = {
  notExisted: "NOT_EXISTED",
  pending: "PENDING",
  failed: "FAILED",
  mined: "MINED",
};

const FAILED_MESSAGE_DISPLAY_TIME = 20; // seconds
// todo: use a object to gather all tip?
const IE_ADVICE =
  "We recommend using Chrome/Safari/Firefox to view our page. In recent time we don't support IE!";
const INPUT_STARTS_WITH_MINUS_TIP = "Input can't starts with minus symbol!";
const INPUT_ZERO_TIP = "Input can't be 0!";
const BALANCE_LESS_THAN_OPERATE_LIMIT_TIP = `Your balance is less than the operate limit ${RESOURCE_OPERATE_LIMIT}`;
const OPERATE_NUM_TOO_SMALL_TO_CALCULATE_REAL_PRICE_TIP =
  "Your operating number is too small.";
const BUY_OR_SELL_MORE_THAN_ASSETS_TIP =
  "Buy or sell more than available assets";
const BUY_OR_SELL_MORE_THAN_THE_INVENTORY_TIP =
  "Please purchase or sell a smaller amount of resources than the inventory in the resource contract.";
const TRANSACT_LARGE_THAN_ZERO_TIP =
  "You should transact an amount large than 0.";
const ONLY_POSITIVE_FLOAT_OR_INTEGER_TIP =
  "Only support positive float and integer.";
const CHECK_BALANCE_TIP = "Please Check your balance Then.";
const BUY_MORE_THAN_HALT_OF_INVENTORY_TIP =
  "Sorry, you can not buy so many resources in one time.";
const INPUT_NUMBER_TIP = "Your should input a number";
const BETWEEN_ZEOR_AND_BALANCE_TIP = "Too large value";
const SELECT_SOMETHING_TIP = "Please select something to continue";
const NEED_PLUGIN_AUTHORIZE_TIP = "Need plugin's authorization.";
const RUN_INDIVIDUAL_NODES_TIP =
  "BPs need to run individual nodes for both aelf MainChain and all the SideChains.";
const UNKNOWN_ERROR_TIP =
  "Sorry, it seems that we encountered an unknown error.";
const NO_AUTHORIZATION_ERROR_TIP =
  "Sorry, you temporarily don't has the authorization to the page.";
const INPUT_SOMETHING_TIP = "Sorry, you should input something";
const INTEGER_TIP = "It can only be integer";
const UNLOCK_PLUGIN_TIP =
  "Your plugin has beed locked, please unlock and refresh the page";
const ALREADY_BEEN_CURRENT_CANDIDATE_TIP = "You already been candidate";
const NOT_CURRENT_CANDIDATE_TIP =
  "Sorry, the node is not current candidate \n Please refresh the page then choose another node to vote.";
const THE_REASON_TO_BECOME_A_NON_CANDIDATE =
  "It may be result from: \n 1. The node has quited election during the time. \n 2. The node became an evil node then was kicked out of the candidates.";
const FEE_TIP = "A bit fee of ELF will be deducted from the operation";
const ELECTION_NOTIFI_DATA_TIP =
  "The election term is 7 days, there is no interval between terms; the number of nodes is the total number of current production nodes and candidate nodes; the number of votes is the sum of the votes amount since the election started; the reward pool includes a block reward of the production nodes, 90% of the transaction fee and 50% of the resource tokens transaction fee.";
const MY_VOTE_DATA_TIP =
  "The Total Votes is the votes amount you voted, and the Redeemable Votes is the number of votes that has expired.";
const GET_NULL = "Cannot read property 'error' of null";
const FEE_RATE = 0.005;
const SHORTEST_LOCK_TIME = 90; // day

// TODO 
// var RPCSERVER = DEFAUTRPCSERVER;

// TODO: Why is this undefined?
// const BLOCKS_LIST_COLUMNS = [
//   {
//     title: "Height",
//     dataIndex: "block_height",
//     key: "block_height",
//     width: 150,
//     render: (text) => <Link href={`/block/${text}`}> {text} </Link>,
//   },
//   {
//     title: "Block Hash",
//     dataIndex: "block_hash",
//     key: "block_hash",
//     width: 280,
//     ellipsis: true,
//     render: (text, row) => (
//       <Link title={text} href={`/block/${row.block_height}`}>
//         {" "}
//         {text}{" "}
//       </Link>
//     ),
//   },
//   {
//     title: "Miner",
//     dataIndex: "miner",
//     key: "miner",
//     width: 280,
//     ellipsis: true,
//     render(text) {
//       return (
//         <Link
//           title={`${SYMBOL}_${text}_${CHAIN_ID}`}
//           href={`/address/${addressFormat(text)}`}
//         >{`${SYMBOL}_${text}_${CHAIN_ID}`}</Link>
//       );
//     },
//   },
//   {
//     title: "Dividends",
//     dataIndex: "dividends",
//     key: "dividends",
//     width: 120,
//     render(text) {
//       return <Dividends dividends={JSON.parse(text)} />;
//     },
//   },
//   {
//     title: "Txs",
//     dataIndex: "tx_count ",
//     key: "tx_count ",
//     width: 60,
//     render: (text, row) =>
//       !Number.isNaN(+row.tx_count) && +row.tx_count !== 0 ? (
//         <Link href={`${mainExplorer}/txs/block?${row.block_hash}`}> {row.tx_count} </Link>
//       ) : (
//         row.tx_count
//       ),
//   },
//   {
//     title: "Time",
//     dataIndex: "time",
//     key: "time",
//     render: (time) => (
//       <span> {dayjs(time).format("YYYY/MM/DD HH:mm:ss")} </span>
//     ),
//     //     return <span> {dayjs().from(dayjs(time), true)} </span>;
//   },
// ];

export const CONTRACT_VIEWER_URL = "/viewer/address.html#/contract/";

// const ALL_TXS_LIST_COLUMNS = [
//   {
//     title: "Tx Id",
//     dataIndex: "tx_id",
//     key: "tx_id",
//     width: 300,
//     ellipsis: true,
//     render: (text, row) => (
//       <Link href={`${mainExplorer}/tx/${row.tx_id}`} title={row.tx_id}>
//         {row.tx_id}
//       </Link>
//     ),
//   },
//   {
//     title: "Height",
//     dataIndex: "block_height",
//     key: "block_height",
//     width: 150,
//     align: "center",
//     render: (text, row) => (
//       <Link href={`${mainExplorer}/block/${row.block_height}`} title={row.block_height}>
//         {" "}
//         {row.block_height}{" "}
//       </Link>
//     ),
//   },
//   {
//     title: "From ",
//     dataIndex: "address_from",
//     key: "address_from",
//     ellipsis: true,
//     render: (text) => (
//       <Link href={`${mainExplorer}/address/${text}`} title={addressFormat(text)}>
//         {" "}
//         {addressFormat(text)}
//       </Link>
//     ),
//   },
//   {
//     title: null,
//     key: "payIcon",
//     width: 50,
//     render: () => <ArrowRightOutlined />,
//   },
//   {
//     title: "To",
//     dataIndex: "address_to",
//     key: "address_to",
//     ellipsis: true,
//     render: (text, row) => {
//       const { contractName, isSystemContract } = row.contractName || {};
//       const name = isSystemContract
//         ? removeAElfPrefix(contractName)
//         : contractName;
//       return (
//         <Link href={`/contract/${text}`} title={addressFormat(text)}>
//           {name || addressFormat(text)}
//         </Link>
//       );
//     },
//   },
//   {
//     title: "Method",
//     dataIndex: "method",
//     key: "method",
//     ellipsis: true,
//   },
//   {
//     title: "Tx Fee",
//     dataIndex: "tx_fee",
//     key: "tx_fee",
//     render(text) {
//       return <Dividends dividends={JSON.parse(text)} />;
//     },
//   },
//   {
//     title: "Amount",
//     dataIndex: "amount",
//     key: "amount",
//     render: (text, row) => {
//       let amount = "-";
//       let symbol;
//       if (row.quantity && row.decimals) {
//         // 1e-7
//         if (row.quantity <= 99) {
//           amount = `0.000000${row.quantity}`;
//         } else if (row.quantity <= 9) {
//           amount = `0.0000000${row.quantity}`;
//         } else {
//           amount = row.quantity / 10 ** row.decimals;
//         }
//       }
//       if (row.symbol) {
//         symbol = `(${row.symbol})`;
//       }
//       return (
//         <span>
//           {amount}
//           {symbol}
//         </span>
//       );
//     },
//   },
// ];

const ADDRESS_INFO_COLUMN = [
  {
    title: "address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "balance",
    dataIndex: "balance",
    key: "balance",
  },
  {
    title: "value",
    dataIndex: "value",
    key: "value",
  },
];
// start
const RESOURCE_DETAILS_COLUMN = [
  {
    title: "Tx Id",
    dataIndex: "tx_id",
    key: "tx_id",
    align: "left",
    ellipsis: true,
    width: 150,
    render: (text) => <Link href={`${mainExplorer}/tx/${text}`}>{text}</Link>,
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
    align: "center",
    width: 160,
    render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "Type(Resource)",
    dataIndex: "type",
    key: "type",
    align: "center",
    width: 140
  },
  {
    title: "Operation",
    dataIndex: "method",
    key: "method",
    align: "center",
    width: 120,
    render: (text) => (
      <span className={`${(text || "buy").toLocaleLowerCase()}-color`}>
        {text}
      </span>
    ),
  },
  {
    title: "Price(ELF)",
    dataIndex: "fee",
    key: "fee",
    align: "center",
    width: 120,
    render: (_, row) => {
      let price;
      const { resource, method } = row;
      let { elf, fee } = row;
      elf /= ELF_DECIMAL;
      fee /= ELF_DECIMAL;
      price = ((method === "Buy" ? elf + fee : elf - fee) / resource).toFixed(
        ELF_PRECISION
      );
      price = Number.isNaN(price) ? "-" : price;
      return price;
    },
  },
  {
    title: "Amount(Resource)",
    dataIndex: "resource",
    key: "number",
    align: "center",
    width: 150
  },
  {
    title: `Sum(${SYMBOL})`,
    dataIndex: "elf",
    key: "elfNumber",
    align: "center",
    width: 150,
    render: (text, row) => {
      const { method } = row;
      let { elf, fee } = row;
      elf /= ELF_DECIMAL;
      fee /= ELF_DECIMAL;
      const actualNumber = (method === "Buy" ? elf + fee : elf - fee).toFixed(
        ELF_PRECISION
      );
      return actualNumber;
    },
  },
  {
    title: "Fee(ELF)",
    dataIndex: "fee",
    key: "serviceCharge",
    align: "center",
    width: 150,
    render: (text, row) => {
      let { fee } = row;
      fee /= ELF_DECIMAL;
      return (fee || 0).toFixed(ELF_PRECISION);
    },
  },
  {
    title: "Tx status",
    dataIndex: "tx_status",
    key: "tx_status",
    align: "center",
    width: 150
  },
];


export {
  ALL_BLOCKS_API_URL,
  ALL_UNCONFIRMED_BLOCKS_API_URL,
  ALL_BLOCKS_UNCONFIRMED_BLOCKS_API_URL,
  ALL_TXS_UNCONFIRMED_TXS_API_URL,
  ALL_TXS_API_URL,
  ALL_UNCONFIRMED_TXS_API_URL,
  TXS_BLOCK_API_URL,
  ADDRESS_TXS_API_URL,
  ADDRESS_BALANCE_API_URL,
  VIEWER_GET_ALL_TOKENS,
  ADDRESS_TOKENS_API_URL,
  TPS_LIST_API_URL,
  ELF_REALTIME_PRICE_URL,
  ELF_REST_TRADE_API,
  PAGE_SIZE,
  TXSSTATUS,
  txStatusInUpperCase,
  // RPCSERVER,
  // BLOCKS_LIST_COLUMNS,
  // ALL_TXS_LIST_COLUMNS,
  ADDRESS_INFO_COLUMN,
  RESOURCE_REALTIME_RECORDS,
  RESOURCE_TURNOVER,
  RESOURCE_RECORDS,
  RESOURCE_DETAILS_COLUMN,
  SOCKET_URL,
  SOCKET_URL_NEW,
  BASIC_INFO,
  IE_ADVICE,
  INPUT_STARTS_WITH_MINUS_TIP,
  INPUT_ZERO_TIP,
  BALANCE_LESS_THAN_OPERATE_LIMIT_TIP,
  OPERATE_NUM_TOO_SMALL_TO_CALCULATE_REAL_PRICE_TIP,
  BUY_OR_SELL_MORE_THAN_ASSETS_TIP,
  BUY_OR_SELL_MORE_THAN_THE_INVENTORY_TIP,
  TRANSACT_LARGE_THAN_ZERO_TIP,
  ONLY_POSITIVE_FLOAT_OR_INTEGER_TIP,
  CHECK_BALANCE_TIP,
  BUY_MORE_THAN_HALT_OF_INVENTORY_TIP,
  INPUT_NUMBER_TIP,
  BETWEEN_ZEOR_AND_BALANCE_TIP,
  SELECT_SOMETHING_TIP,
  RUN_INDIVIDUAL_NODES_TIP,
  NEED_PLUGIN_AUTHORIZE_TIP,
  UNKNOWN_ERROR_TIP,
  NO_AUTHORIZATION_ERROR_TIP,
  INPUT_SOMETHING_TIP,
  INTEGER_TIP,
  UNLOCK_PLUGIN_TIP,
  ALREADY_BEEN_CURRENT_CANDIDATE_TIP,
  NOT_CURRENT_CANDIDATE_TIP,
  ELECTION_NOTIFI_DATA_TIP,
  MY_VOTE_DATA_TIP,
  THE_REASON_TO_BECOME_A_NON_CANDIDATE,
  FEE_TIP,
  HISTORY_PRICE,
  GET_NULL,
  SHORTEST_LOCK_TIME,
  FAILED_MESSAGE_DISPLAY_TIME,
  SYMBOL,
  LOWER_SYMBOL,
  CHAIN_ID,
  ELF_DECIMAL,
  TEMP_RESOURCE_DECIMAL,
  ELF_PRECISION,
  GENERAL_PRECISION,
  RESOURCE_OPERATE_LIMIT,
  FEE_RATE,
  REAL_TIME_FETCH_INTERVAL,
  RESOURCE_CURRENCY_CHART_FETCH_INTERVAL,
  LONG_NOTIFI_TIME,
};
