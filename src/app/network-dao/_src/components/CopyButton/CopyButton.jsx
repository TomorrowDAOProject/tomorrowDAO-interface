import React from "react";
import copy from "copy-to-clipboard";
import IconFont from "../IconFont";
import { toast } from 'react-toastify';

export default function CopyButton({
  value = undefined,
  onClick = undefined,
}) {
  const handleCopy = () => {
    try {
      copy(value);
      toast.success('Copied Successfully');
    } catch (e) {
      toast.error('Copy failed, please copy by yourself.');
    }
  };
  return (
    <IconFont
      className="copy-btn"
      style={{ fontSize: 16, color: "#266CD3" }}
      type="copy"
      onClick={onClick || handleCopy}
    />
  );
}
