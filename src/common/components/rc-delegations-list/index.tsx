import React, { useEffect, useState } from "react";
import { Button, FormControl } from "react-bootstrap";
import { getOutgoingRc, getIncomingRc } from "../../api/hive";
import { delegateRC } from "../../api/operations";
import { _t } from "../../i18n";
import LinearProgress from "../linear-progress";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { useParams } from "react-router";
import { getAccount } from "../../api/hive";
import { Account } from "../../store/accounts/types";

interface Props {
  addAccount: (data: Account) => void;
}

export const RcDelegationsList = (props: any) => {
  const params: any = useParams();

  const {
    activeUser,
    rcFormatter,
    showDelegation,
    listMode,
    setToFromList,
    setAmountFromList,
    confirmDelete,
    setDelegateeData,
    setShowDelegationsList
  } = props;

  const [outGoingList, setOutGoingList]: any = useState([]);
  const [incoming, setIncoming]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setsearch] = useState("");
  const [loadList, setLoadList] = useState(21);

  useEffect(() => {
    getOutGoingRcList();
    getIncomingRcList();
  }, []);

  const getOutGoingRcList = async () => {
    setLoading(true);
    const paramsAccount = params.username.substring(1);
    const delegationsOutList: any = await getOutgoingRc(paramsAccount, "");
    const delegationsOutInfo = delegationsOutList.rc_direct_delegations;
    setOutGoingList(delegationsOutInfo);
    setLoading(false);
  };

  const getIncomingRcList = async () => {
    setLoading(true);
    const paramsAccount = params.username.substring(1);
    const delegationsIn: any = await getIncomingRc(paramsAccount);
    const incomingInfo = delegationsIn.list;
    setIncoming(incomingInfo);
    setLoading(false);
  };

  const loadMore = () => {
    const moreList = loadList + 7;
    setLoadList(moreList);
  };

  const getToData = async (data: any) => {
    const toData = await getAccount(data);
    return toData;
  };

  return (   
      <div className="delgations-list">
          {loading && (
            <div className="delegation-loading">
              <LinearProgress />
            </div>
          )}
        <div className="list-container">
            <div className="search-box">
              <FormControl     
                value={search}
                placeholder="search list"
                onChange={(e) => setsearch(e.target.value)}
              />
            </div>

        {listMode === "out" && (
          <>
          {outGoingList.length > 0 ? <div className="list-body">
            {outGoingList
              ?.slice(0, loadList)
              .filter(
                (list: any) =>
                  list.to.toLowerCase().startsWith(search) || list.to.toLowerCase().includes(search)
              )
              .map((list: any, i: any) => { 
              return (
                <div className="list-item" key={i}>
                  <div className="item-main">
                    {ProfileLink({
                      ...props,
                      username: list.to,
                      children: <>{UserAvatar({ ...props, size: "small", username: list.to })}</>
                    })}
                    <div className="item-info">
                      {ProfileLink({
                        ...props,
                        username: list.to,
                        children: <a className="item-name notransalte">{list.to}</a>
                      })}
                      <span className="item-reputation">{rcFormatter(list.delegated_rc)}</span>
                      {list.from === activeUser.username && (
                        <>
                          <a
                            className="item-reputation cursor-pointer"
                            onClick={async () => {
                              showDelegation();
                              setShowDelegationsList(false);
                              setAmountFromList(list.delegated_rc);
                              setToFromList(list.to);
                              const data = await getToData(list.to);
                              setDelegateeData(data);
                            }}
                          >
                            {_t("rc-info.update")}
                          </a>
                          <a
                            className="item-reputation cursor-pointer"
                            onClick={() => {
                              confirmDelete();
                              setToFromList(list.to);
                            }}
                          >
                            {_t("rc-info.delete")}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )})}
          </div> : <p>{_t("rc-info.no-outgoing")}</p>}
          </>
        )}

        {listMode === "in" && (
          <>
          {incoming.length > 0 ? <div className="list-body">
            {incoming
              ?.slice(0, loadList)
              .filter(
                (list: any) =>
                  list.sender.toLowerCase().startsWith(search) ||
                  list.sender.toLowerCase().includes(search)
              )
              .map((list: any, i: any) => (
                <div className="list-item" key={i}>
                  <div className="item-main">
                    {ProfileLink({
                      ...props,
                      username: list.sender,
                      children: (
                        <>{UserAvatar({ ...props, username: list.sender, size: "small" })}</>
                      )
                    })}
                    <div className="item-info">
                      {ProfileLink({
                        ...props,
                        username: list.sender,
                        children: <a className="item-name notransalte">{list.sender}</a>
                      })}
                      <span className="item-reputation">{rcFormatter(list.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div> : <p>{_t("rc-info.no-incoming")}</p>}
          </>
        )}

            {((listMode === "in" && incoming.length >= loadList) || 
            (listMode === "out" && outGoingList.length >= loadList))  && 
            <div className="load-more-btn">
              <Button  onClick={loadMore}>
                {_t("g.load-more")}
              </Button>
            </div>}
          </div>
      </div>
  );
};

export const ConfirmDelete = (props: any) => {
  const { to, activeUser, hideConfirmDelete } = props;
  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "25%",
          flexDirection: "column"
        }}
      >
        <h5 className="text" style={{ width: "350px", alignSelf: "center" }}>
          {_t("rc-info.confirm-delete")}
        </h5>
        <div className="d-flex justify-content-center p-3">
          <Button className="mr-2" variant="outline-secondary" onClick={hideConfirmDelete}>
            {_t("rc-info.cancel")}
          </Button>
          <Button
            className="ml-2"
            onClick={() => {
              delegateRC(activeUser.username, to, 0);
              hideConfirmDelete();
            }}
          >
            {_t("rc-info.confirm")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default (p: Props) => {
  const props: Props = {
    addAccount: p.addAccount
  };

  return <RcDelegationsList {...props} />;
};
