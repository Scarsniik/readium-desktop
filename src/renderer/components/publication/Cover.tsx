// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { lazyInject } from "readium-desktop/renderer/di";

import { Translator } from "readium-desktop/common/services/translator";

import { PublicationView } from "readium-desktop/common/views/publication";

import * as styles from "readium-desktop/renderer/assets/styles/publication.css";

interface ICoverProps {
    publication: PublicationView;
}

export default class Cover extends React.Component<ICoverProps, null> {
    @lazyInject("translator")
    private translator: Translator;

    public render(): React.ReactElement<{}>  {

        if (this.props.publication.cover == null) {
            let authors = "";

            for (const author of this.props.publication.authors) {
                const newAuthor = author;
                if (authors !== "") {
                    authors += ", ";
                }
                authors += this.translator.translateContentField(newAuthor);
            }
            let colors = this.props.publication.customCover;
            if (colors === undefined) {
                colors = {
                    topColor: "#d18e4b",
                    bottomColor: "#7c4c1c",
                };
            }
            const backgroundStyle = {
                backgroundImage: `linear-gradient(${colors.topColor}, ${colors.bottomColor})`,
            };

            return (
                <div style={backgroundStyle} className={styles.cover}>
                    <div className={styles.box}>
                        <p className={styles.title}>
                            {this.translator.translateContentField(this.props.publication.title)}
                        </p>
                        <p className={styles.author}>{authors}</p>
                    </div>
                </div>
            );
        } else {
            return <img src={this.props.publication.cover.url}/>;
        }
    }
}
