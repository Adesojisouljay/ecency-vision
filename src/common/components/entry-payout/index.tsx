import React, {Component, Fragment} from "react";

import moment from "moment";

import {Popover, OverlayTrigger} from "react-bootstrap";

import {Entry} from "../../store/entries/types";
import {Global} from "../../store/global/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import FormattedCurrency from "../formatted-currency/index";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";

import formattedNumber from "../../util/formatted-number";

import {_t} from "../../i18n";


interface Props {
    global: Global;
    dynamicProps: DynamicProps;
    entry: Entry;
}

export class EntryPayoutDetail extends Component<Props> {
    render() {
        const {entry, dynamicProps} = this.props;

        const {base, quote, hbdPrintRate} = dynamicProps;

        const payoutDate = moment(parseDate(entry.payout_at));

        const beneficiary = entry.beneficiaries;
        const pendingPayout = parseAsset(entry.pending_payout_value).amount;
        const promotedPayout = parseAsset(entry.promoted).amount;
        const authorPayout = parseAsset(entry.author_payout_value).amount;
        const curatorPayout = parseAsset(entry.curator_payout_value).amount;

        const HBD_PRINT_RATE_MAX = 10000;
        const percentHiveDollars = (entry.percent_hbd || entry.percent_steem_dollars || 10000) / 20000;
        const pendingPayoutHbd = pendingPayout * (percentHiveDollars);
        const pricePerHive = base / quote;
        const pendingPayoutHp = (pendingPayout - pendingPayoutHbd) / pricePerHive;
        const pendingPayoutPrintedHbd = pendingPayoutHbd * (hbdPrintRate / HBD_PRINT_RATE_MAX);
        const pendingPayoutPrintedHive = (pendingPayoutHbd - pendingPayoutPrintedHbd) / pricePerHive;

        let breakdownPayout: string[] = [];
        if (pendingPayout > 0) {
            if (pendingPayoutPrintedHbd > 0) {
                breakdownPayout.push(formattedNumber(pendingPayoutPrintedHbd, {fractionDigits: 3, suffix: 'HBD'}))
            }

            if (pendingPayoutPrintedHive > 0) {
                breakdownPayout.push(formattedNumber(pendingPayoutPrintedHive, {fractionDigits: 3, suffix: 'HIVE'}))
            }

            if (pendingPayoutHp > 0) {
                breakdownPayout.push(formattedNumber(pendingPayoutHp, {fractionDigits: 3, suffix: 'HP'}))
            }
        }

        return (
            <div className="payout-popover-content">
                {pendingPayout > 0 &&
                <p>
                  <span className="label">{_t("entry-payout.pending-payout")}</span>
                  <span className="value"><FormattedCurrency {...this.props} value={pendingPayout} fixAt={3}/></span>
                </p>
                }
                {promotedPayout > 0 &&
                <p>
                  <span className="label">{_t("entry-payout.promoted")}</span>
                  <span className="value"><FormattedCurrency {...this.props} value={promotedPayout} fixAt={3}/></span>
                </p>
                }
                {authorPayout > 0 &&
                <p>
                  <span className="label">{_t("entry-payout.author-payout")}</span>
                  <span className="value"><FormattedCurrency {...this.props} value={authorPayout} fixAt={3}/></span>
                </p>
                }
                {curatorPayout > 0 &&
                <p>
                  <span className="label">{_t("entry-payout.curators-payout")}</span>
                  <span className="value"><FormattedCurrency {...this.props} value={curatorPayout} fixAt={3}/></span>
                </p>
                }
                {beneficiary.length > 0 && (
                    <p>
                        <span className="label">{_t("entry-payout.beneficiary")}</span>
                        <span className="value">{beneficiary.map(((x, i) => <Fragment key={i}>{x.account}: {(x.weight / 100).toFixed(0)}% <br/></Fragment>))}</span>
                    </p>
                )}
                {breakdownPayout.length > 0 && (
                    <p>
                        <span className="label">{_t("entry-payout.breakdown")}</span>
                        <span className="value">{breakdownPayout.map(((x, i) => <Fragment key={i}>{x} <br/></Fragment>))}</span>
                    </p>
                )}
                <p>
                    <span className="label">{_t("entry-payout.payout-date")}</span>
                    <span className="value">{payoutDate.fromNow()}</span>
                </p>
            </div>
        );
    }
}

export class EntryPayout extends Component<Props> {
    render() {
        const {entry} = this.props;

        const isPayoutDeclined = parseAsset(entry.max_accepted_payout).amount === 0;

        const pendingPayout = parseAsset(entry.pending_payout_value).amount;
        const authorPayout = parseAsset(entry.author_payout_value).amount;
        const curatorPayout = parseAsset(entry.curator_payout_value).amount;

        const totalPayout = pendingPayout + authorPayout + curatorPayout;

        const popover = (
            <Popover id={`payout-popover`} className="payout-popover">
                <Popover.Content>
                    <EntryPayoutDetail {...this.props} />
                </Popover.Content>
            </Popover>
        );

        return (
            <OverlayTrigger trigger={["hover", "focus"]} overlay={popover} delay={1000}>
                <div className={`entry-payout ${isPayoutDeclined ? "payout-declined" : ""}`}>
                    <FormattedCurrency {...this.props} value={totalPayout}/>
                </div>
            </OverlayTrigger>
        );
    }
}


export default (p: Props) => {
    const props = {
        global: p.global,
        dynamicProps: p.dynamicProps,
        entry: p.entry
    }

    return <EntryPayout {...props} />
}
