import { Action } from "redux";

import { Publication } from "readium-desktop/models/publication";
import { Reader } from "readium-desktop/models/reader";

export const READER_INIT = "READER_INIT";
export const READER_OPEN = "READER_OPEN";
export const READER_CLOSE = "READER_CLOSE";

export interface ReaderAction extends Action {
    reader?: Reader;
    publication?: Publication;
}

export function initReader(publication: Publication): ReaderAction {
    return {
        type: READER_INIT,
        publication,
    };
}

export function openReader(reader: Reader): ReaderAction {
    return {
        type: READER_OPEN,
        reader,
    };
}

export function closeReader(reader: Reader): ReaderAction {
    return {
        type: READER_CLOSE,
        reader,
    };
}