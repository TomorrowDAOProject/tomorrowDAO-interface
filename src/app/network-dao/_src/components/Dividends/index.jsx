/**
 * @file dividend
 * @author atom-yang
 */
import React from "react";
import { Dropdown, Button, Menu } from "antd";
import { If, Then, Else } from "react-if";
import { DownOutlined } from "@ant-design/icons";
import { numberFormatter } from "../../utils/formater";

const Dividends = (props) => {
  const { dividends, defaultSymbol, useButton = true, valueClassName, buttonClassName, ...rest } = props;
  const keys = Object.keys(dividends || {});
  const defaultKey =
    defaultSymbol !== undefined
      ? defaultSymbol
      : dividends?.ELF !== undefined
      ? "ELF"
      : keys[0] || "ELF";
  return (
    <>
      <If condition={!dividends || !dividends.ELF}>
        <Then>
          <span className={valueClassName}>-</span>
        </Then>
        <Else>
          <If condition={keys.length > 1}>
            <Then>
              <Dropdown
                overlay={
                  <Menu>
                    {keys.map((key) => (
                      <Menu.Item key={key}>
                        {(dividends ?? {})[key]}&nbsp;{key}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                {...rest}
              >
                {useButton ? (
                  <Button className={buttonClassName}>
                    {(dividends ?? {})[defaultKey] || 0}&nbsp;{defaultKey}
                    <DownOutlined />
                  </Button>
                ) : (
                  <div>
                    {(dividends ?? {})[defaultKey] || 0}&nbsp;{defaultKey}
                    <DownOutlined />
                  </div>
                )}
              </Dropdown>
            </Then>
            <Else>
              <div {...rest} className={valueClassName}>
                {numberFormatter((dividends ?? {})[defaultKey]) || 0}&nbsp;
                {defaultKey}
              </div>
            </Else>
          </If>
        </Else>
      </If>
    </>
  );
};

export default React.memo(Dividends);
