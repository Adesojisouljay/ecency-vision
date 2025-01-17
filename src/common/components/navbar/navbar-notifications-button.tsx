import ToolTip from "../tooltip";
import { _t } from "../../i18n";
import { bellOffSvg, bellSvg } from "../../img/svg";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_navbar-notifications-button.scss";
import { Button } from "@ui/button";

export function NavbarNotificationsButton({ onClick }: { onClick?: () => void }) {
  const { global, toggleUIProp, notifications } = useMappedStore();

  return global.usePrivate ? (
    <>
      <ToolTip content={_t("user-nav.notifications")}>
        <div
          className="notifications"
          onClick={() => {
            toggleUIProp("notifications");
            onClick?.();
          }}
        >
          {notifications.unread > 0 && (
            <span className="notifications-badge notranslate">
              {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
            </span>
          )}

          {/* //////notification */}
          <Button icon={global.notifications ? bellSvg : bellOffSvg} appearance="gray-link" />
        </div>
      </ToolTip>
    </>
  ) : (
    <></>
  );
}
