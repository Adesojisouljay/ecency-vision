import React, { Component } from "react";

import { History } from "history";

import { Button } from "react-bootstrap";

import { State as GlobalState } from "../../store/global/types";
import { Community } from "../../store/communities/types";

import AccountLink from "../account-link";
import DownloadTrigger from "../download-trigger";

import ln2list from "../../util/nl2list";

import { accountGroupSvg } from "../../../svg";

interface Props {
  history: History;
  global: GlobalState;
  community: Community;
}

export default class CommunityCard extends Component<Props> {
  render() {
    const { community } = this.props;

    console.log(community);
    return (
      <div className="community-card">
        <h2 className="community-title">
          {accountGroupSvg} {community.title}
        </h2>

        <div className="community-panel">
          <div className="section-about">{community.about}</div>

          <div className="section-stats">
            <div className="stat">{community.subscribers} subscribers</div>
            <div className="stat">{community.sum_pending} pending rewards</div>
            <div className="stat">{community.num_authors} active posters</div>
          </div>

          <div className="section-controls">
            <DownloadTrigger>
              <Button variant="primary" block={true}>
                Subscribe
              </Button>
            </DownloadTrigger>
            <DownloadTrigger>
              <Button variant="primary" block={true}>
                New Post
              </Button>
            </DownloadTrigger>
          </div>

          <div className="section-team">
            <h4 className="section-header">Leadership</h4>
            {community.team.map((m) => (
              <div className="team-member">
                <AccountLink {...this.props} username={m[0]}>
                  <a className="username">{`@${m[0]}`}</a>
                </AccountLink>
                <span className="role">{m[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="community-panel">
          <div className="section-description">
            <h4 className="section-header">Description</h4>
            {ln2list(community.description).map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
          <div className="section-rules">
            <h4 className="section-header">Rules</h4>
            <ol>
              {ln2list(community.flag_text).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </div>
          <div className="section-lang">
            <h4 className="section-header">Language</h4>
            {community.lang}
          </div>
        </div>
      </div>
    );
  }
}