// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { TranslatorProps } from "readium-desktop/renderer/components/utils/translator";

import * as dialogActions from "readium-desktop/common/redux/actions/dialog";

import { RouteComponentProps, withRouter } from "react-router-dom";

import { connect } from "react-redux";

import { push } from "connected-react-router";

interface OpdsOpdsAuthenticationFormProps extends TranslatorProps {
    url: any;
    closeDialog?: any;
    changeLocation?: any;
}

export class OpdsAuthenticationForm extends React.Component<OpdsOpdsAuthenticationFormProps, undefined> {
    private usernameRef: any;
    private passwordRef: any;

    constructor(props: any) {
        super(props);

        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();

        this.connect = this.connect.bind(this);
    }

    public render(): React.ReactElement<{}> {
        console.log(this.props);
        return (
            <div>
                <h2>Veuillez vous identifier</h2>
                <form onSubmit={ this.connect }>
                    <div>
                        <label>Login : </label>
                        <input
                            ref={ this.usernameRef }
                            type="text"
                            aria-label="Username"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label>Password : </label>
                        <input
                            ref={ this.passwordRef }
                            type="password"
                            aria-label="password"
                        />
                    </div>
                    <button onClick={ this.connect }>
                        Se connecter
                    </button>
                </form>
            </div>
        );
    }

    private connect(e: any) {
        e.preventDefault();
        const credentials = {
            username: this.usernameRef.value,
            password: this.passwordRef.value,
        };
        this.props.changeLocation(this.props.url, {credentials});
        this.props.closeDialog();
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        closeDialog: () => {
            dispatch(
                dialogActions.close(),
            );
        },
        changeLocation: (path: string, state: any) => {
            dispatch(
                push(path, state),
            );
        },
    };
};

export default (connect(undefined, mapDispatchToProps) as any)(withRouter(OpdsAuthenticationForm)) as any;
