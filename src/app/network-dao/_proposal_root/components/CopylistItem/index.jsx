// eslint-disable-next-line no-use-before-define
import React from "react";
import PropTypes from "prop-types";
import copy from "copy-to-clipboard";
import Link from 'next/link';
import { omitString } from "@common/utils";
import "./index.css";
import { toast } from "react-toastify";
const CopylistItem = (props) => {
  const {
    label,
    value = "",
    href,
    isParentHref = false,
    valueHref = "",
  } = props;
  const handleCopy = () => {
    try {
      copy(value);
      // eslint-disable-next-line no-undef
      toast.success("Copied!");
    } catch (e) {
      toast.error("Copy failed, please copy by yourself.");
    }
  };
  return !value ? (
    <div className="flex items-center justify-center mt-5">
      <span className="text-desc12 text-white font-Montserrat">{label}</span>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-5 mt-5">
      <span className="text-desc12 text-white font-Montserrat">{label}:</span>
      <>
        {valueHref ? (
          <a href={valueHref} className="text-desc12 text-secondaryMainColor font-Montserrat">{omitString(value, 10, 10)}</a>
        ) : (
          omitString(value, 10, 10)
        )}
        {href ? (
          <>
            {isParentHref ? (
              <i
                onClick={() => {
                  window.parent.location.replace(href);
                }}
                className="tmrwdao-icon-logout text-[18px] text-lightGray ml-2 -rotate-90"
              />
            ) : (
              <Link href={href}>
                <i className="tmrwdao-icon-logout text-[18px] text-lightGray ml-2 -rotate-90" />
              </Link>
            )}
          </>
        ) : null}
        <i className="tmrwdao-icon-duplicate text-[18px] text-lightGray ml-2 cursor-pointer" onClick={handleCopy} />
      </>
    </div>
  );
};

CopylistItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  isParentHref: PropTypes.bool,
  valueHref: PropTypes.string,
};
CopylistItem.defaultProps = {
  isParentHref: false,
  valueHref: "",
};
export default CopylistItem;
