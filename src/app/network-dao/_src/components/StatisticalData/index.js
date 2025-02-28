/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-09-09 18:52:15
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-12-10 17:00:44
 * @Description: file content
 */
import React from "react";
import Statistic, { Countdown } from "components/Statistic";
import Tooltip from "components/Tooltip";
import Spin from "components/Spin";

import "./index.css";

const clsPrefix = "statistical-data";

const arrFormate = (arr) => {
  switch (arr.length) {
    case 4:
      arr.forEach((item, index) => (item.span = 8 - 4 * (index % 2)));
      break;
    default:
      arr.forEach((item) => (item.span = 24 / arr.length));
      break;
  }
  return arr;
};

const StatisticalData = ({ data, spinning, tooltipClassName, style, inline }) => {
  const arr = Object.values(data);
  if (!arr) return null;

  const renderList = (items) => {
    return items.map((item) => {
      const number = item.num;
      const { tooltip } = item;
      
      if (item.isRender) {
        return item.num;
      }

      const titleNode = (
        <>
          <span>{item.title}</span>
          {tooltip ? (
            <Tooltip title={tooltip} className={tooltipClassName}>
              <i className="tmrwdao-icon-information text-[16px] text-lightGrey" />
            </Tooltip>
          ) : null}
        </>
      );

      return item.isCountdown ? (
        <Countdown
          key={item.title}
          title={titleNode}
          value={Date.now() + 1000 * 60 * 60 * 24}
          format="D day HH : mm : ss"
          onFinish={() => {
            if (item.id) {
              item.num = Date.now() + item.resetTime;
            }
          }}
        />
      ) : (
        <Statistic
          key={item.title}
          title={titleNode}
          value={Number.isNaN(parseInt(number, 10)) ? 0 : number?.toLocaleString()}
        />
      );
    });
  };

  const arrFormatted = arrFormate(arr);
  const listHTML = renderList(arrFormatted);

  return (
    <section style={style}>
      <Spin spinning={spinning}>
        <section className={`${clsPrefix}-container ${inline ? "inline-style" : ""}`}>
          {listHTML}
        </section>
      </Spin>
    </section>
  );
};

StatisticalData.defaultProps = {
  spinning: false,
};

export default StatisticalData;
