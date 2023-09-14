import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../../i18n";
import LinearProgress from "../../linear-progress";
import { ChatContext } from "../chat-context-provider";

import "./index.scss";

interface Props {
  actionType: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
}
const ChatsConfirmationModal = (props: Props) => {
  const { onClose, onConfirm, content, actionType } = props;
  const { hasUserJoinedChat } = useContext(ChatContext);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    if (hasUserJoinedChat && inProgress) {
      setInProgress(false);
    }
  }, [hasUserJoinedChat]);
  const confirmationModalContent = (
    <>
      <div className="join-community-dialog-header border-bottom">
        <div className="join-community-dialog-titles">
          <h2 className="join-community-main-title">{actionType}</h2>
        </div>
      </div>
      {inProgress && <LinearProgress />}
      <div className="join-community-dialog-body">{content}</div>
      <p className="join-community-confirm-buttons">
        <Button
          variant="outline-primary"
          className="close-btn"
          onClick={() => {
            onClose();
          }}
        >
          {_t("chat.close")}
        </Button>
        <Button
          variant="outline-primary"
          className="confirm-btn"
          onClick={() => {
            setInProgress(true);
            onConfirm();
          }}
        >
          {_t("chat.confirm")}
        </Button>
      </p>
    </>
  );

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onClose}
      keyboard={false}
      className="chats-dialog modal-thin-header"
      size="lg"
    >
      <Modal.Header closeButton={true} />
      <Modal.Body className="chat-modals-body">{confirmationModalContent}</Modal.Body>
    </Modal>
  );
};

export default ChatsConfirmationModal;
