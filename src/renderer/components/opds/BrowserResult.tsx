// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { RouteComponentProps, withRouter } from "react-router-dom";

import { withApi } from "readium-desktop/renderer/components/utils/api";

import {
    OpdsResultType,
    OpdsResultView,
} from "readium-desktop/common/views/opds";

import { TranslatorProps } from "readium-desktop/renderer/components/utils/translator";

import EntryList from "./EntryList";
import EntryPublicationList from "./EntryPublicationList";

import Loader from "readium-desktop/renderer/components/utils/Loader";

import { DialogType } from "readium-desktop/common/models/dialog";

import * as dialogActions from "readium-desktop/common/redux/actions/dialog";

interface BrowserResultProps extends RouteComponentProps, TranslatorProps {
    url: string;
    result?: OpdsResultView;
    cleanData: any;
    requestOnLoadData: any;
    browseOpds: any;
    openOpdsAuthenticationForm?: any;
}

export class BrowserResult extends React.Component<BrowserResultProps, null> {
    public componentDidUpdate?(prevProps: BrowserResultProps) {
        if (prevProps.url !== this.props.url) {
            // New url to browse
            this.props.cleanData(),
            this.props.requestOnLoadData();
        }

        console.log(this.props);

        if (this.props.result.needAuthentication &&
        (!this.props.location.state || (this.props.location.state && !this.props.location.state.credentials))) {
            this.props.openOpdsAuthenticationForm(this.props.location.pathname);
        }
    }

    public render(): React.ReactElement<{}>  {
        const { result } = this.props;
        let content = (<Loader/>);

        if (result && !result.needAuthentication) {
            switch (result.type) {
                case OpdsResultType.NavigationFeed:
                    content = (
                        <EntryList entries={ result.navigation } />
                    );
                    break;
                case OpdsResultType.PublicationFeed:
                    content = (
                        <EntryPublicationList publications={ result.publications } />
                    );
                    break;
                default:
                    break;
            }
        } else if (result && result.needAuthentication) {
            content = (
                <div>
                    <p>BESOIN DE S'AUTHENTIFIER</p>
                    { this.props.location.state && this.props.location.state.credentials &&
                        <p>username: {this.props.location.state.credentials.username},
                        password: {this.props.location.state.credentials.password}</p>
                    }
                </div>
            );
        }

        return content;
    }
}

const buildOpdsRequestData = (props: BrowserResultProps) => {
    return { url: props.url };
};

const mapDispatchToProps = (dispatch: any, __1: any) => {
    return {
        openOpdsAuthenticationForm: (url: string) => {
            dispatch(dialogActions.open(
                DialogType.OpdsAuthenticationForm,
                {
                    opds: {url},
                },
            ));
        },
    };
};

export default withApi(
    withRouter(BrowserResult),
    {
        operations: [
            {
                moduleId: "opds",
                methodId: "browse",
                resultProp: "result",
                callProp: "browseOpds",
                buildRequestData: buildOpdsRequestData,
                onLoad: true,
            },
        ],
        mapDispatchToProps,
    },
);
