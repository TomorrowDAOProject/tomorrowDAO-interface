/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-09-21 20:43:03
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-09-27 18:47:29
 * @Description: the api of vote consensus and others vote need
 */
import { apiServer } from 'api/axios'
import getChainIdQuery from 'utils/url';

const chain = getChainIdQuery()

export const getAllTeamDesc = () =>
  apiServer.get("/networkdao/vote/getAllTeamDesc", {
    isActive: true,
    chainId: chain.chainId
  });

export const getTeamDesc = (publicKey) =>
  apiServer.get("/networkdao/vote/getTeamDesc", {
    publicKey,
    chainId: chain.chainId
  });

export const fetchPageableCandidateInformation = (contract, payload) =>
  contract.GetPageableCandidateInformation.call(payload);

export const fetchElectorVoteWithRecords = (contract, payload) =>
  contract.GetElectorVoteWithRecords.call(payload);

export const fetchCount = (contract, payload) =>
  contract.GetCandidates.call(payload);
