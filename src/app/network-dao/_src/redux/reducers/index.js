/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-04 17:10:57
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-04 17:27:29
 * @Description: file content
 */

import { combineReducers } from "redux";
import common from "./common";
import { getOrganization } from "./organizationList";
import { getProposalList } from "./proposalList";
import { setModifyOrg } from "./proposalModify";
import { getProposalSelectList } from "./proposalSelectList";
import { handleContract } from "./voteContracts.ts";

// export default combineReducers({
//   common,
//   organizations: getOrganization,
//   proposals: getProposalList,
//   proposalSelect: getProposalSelectList,
//   proposalModify: setModifyOrg,
//   voteContracts: handleContract,
// });

export {
  common,
  getOrganization,
  getProposalList,
  getProposalSelectList,
  setModifyOrg,
  handleContract,
}