import React, { useContext, useEffect, useState } from "react";
import { History } from "history";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarSearch } from "./chat-sidebar-search";
import { ChatSidebarSearchItem } from "./chat-sidebar-search-item";
import { ChatSidebarDirectContact } from "./chat-sidebar-direct-contact";
import { _t } from "../../../../i18n";
import { ChatSidebarChannel } from "./chat-sidebar-channel";
import {
  ChatContext,
  ChatQueries,
  DirectContact,
  getUserChatPublicKey,
  isCommunity,
  useChannelsQuery,
  useDirectContactsQuery
} from "@ecency/ns-query";
import { useSearchUsersQuery } from "../../queries";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";
import { Community } from "../../../../store/communities";
import { Reputations } from "../../../../api/hive";
import { useGetAccountFullQuery } from "../../../../api/queries";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  username: string;
  history: History;
  isChannel: boolean;
}

export default function ChatsSideBar(props: Props) {
  const { username } = props;
  const queryClient = useQueryClient();
  const { setRevealPrivateKey, setReceiverPubKey, activeUsername } = useContext(ChatContext);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const chatsSideBarRef = React.createRef<HTMLDivElement>();

  const [selectedAccount, setSelectedAccount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDivider, setShowDivider] = useState(false);

  const { data: selectedAccountData } = useGetAccountFullQuery(selectedAccount);
  const { data: searchUsers } = useSearchUsersQuery(searchQuery);
  const { data: searchCommunities } = useSearchCommunitiesQuery(searchQuery);

  // Create temporary contact and select it when searching users
  // `not_joined_${selectedAccount}` – special constructor for creating a temporary contact
  useEffect(() => {
    if (selectedAccount && selectedAccountData) {
      queryClient.setQueryData<DirectContact[]>(
        [ChatQueries.DIRECT_CONTACTS, activeUsername],
        [
          ...(queryClient.getQueryData<DirectContact[]>([
            ChatQueries.DIRECT_CONTACTS,
            activeUsername
          ]) ?? []),
          {
            name: selectedAccount,
            pubkey: getUserChatPublicKey(selectedAccountData) ?? `not_joined_${selectedAccount}`
          }
        ]
      );
      setReceiverPubKey(
        getUserChatPublicKey(selectedAccountData) ?? `not_joined_${selectedAccount}`
      );
    }
  }, [selectedAccount, selectedAccountData]);

  return (
    <div className="flex flex-col h-full">
      <ChatSidebarHeader history={props.history} />
      <ChatSidebarSearch setSearch={setSearchQuery} />
      {showDivider && <div className="divider" />}
      <div className="flex flex-col" ref={chatsSideBarRef}>
        {searchQuery ? (
          [...searchUsers, ...searchCommunities].map((item) => (
            <ChatSidebarSearchItem
              item={item}
              onClick={async () => {
                setSearchQuery("");
                setRevealPrivateKey(false);

                const community = item as Community;
                if (community.name && isCommunity(community.name)) {
                  props.history.push(`/chats/${(item as Community).name}/channel`);
                } else {
                  setSelectedAccount((item as Reputations).account);
                }
              }}
              key={"account" in item ? item.account : item.id}
            />
          ))
        ) : (
          <>
            {channels?.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.communities")}
              </div>
            )}
            {channels?.map((channel) => (
              <ChatSidebarChannel
                isChannel={props.isChannel}
                key={channel.id}
                channel={channel}
                username={username}
              />
            ))}
            {directContacts?.length !== 0 && (
              <div className="mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                {_t("chat.direct-messages")}
              </div>
            )}
            {directContacts?.map((contact) => (
              <ChatSidebarDirectContact key={contact.pubkey} contact={contact} />
            ))}
          </>
        )}
      </div>
      {directContacts?.length === 0 && channels?.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
          {_t("chat.no-contacts-or-channels")}
        </div>
      )}
    </div>
  );
}
