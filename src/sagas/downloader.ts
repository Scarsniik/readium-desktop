import * as fs from "fs";
import { Buffer, buffers, channel, SagaIterator } from "redux-saga";
import { actionChannel, call, cancel, fork, put, take } from "redux-saga/effects";
import * as request from "request";

import {
    DOWNLOAD_ADD,
    DOWNLOAD_CANCEL,
    DOWNLOAD_FINISH,
} from "readium-desktop/downloader/constants";

import * as downloaderActions from "readium-desktop/actions/downloader";
import { Download } from "readium-desktop/models/download";

function downloadContent(download: Download, chan: any) {
    // Do not pipe request directly to this stream to void blocking issues
    let outputStream = fs.createWriteStream(download.dstPath);

    // 5 seconds of timeout
    let requestStream = request.get(
        download.srcUrl,
        {timeout: 5000},
    );

    requestStream.on("response", (response: any) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
            // Unable to download the resource
            chan.put({
                error: true,
                msg: "Bad status code: " + response.statusCode,
            });
        }

        const totalSize: number = response.headers["content-length"];
        let downloadedSize: number = 0;

        response.on("data", (chunk: any) => {
            // Write chunk
            outputStream.write(chunk);

            // Download progress
            downloadedSize += chunk.length;
            chan.put({
                error: false,
                progress: Math.round((downloadedSize / totalSize) * 100),
            });
        });

        response.on("end", () => {
            outputStream.end();
            // Download finished
            chan.put({
                error: false,
                progress: 100,
            });
        });
    });

    // Catch errors
    requestStream.on("error", (error: any) => {
        // Download error
        outputStream.end();
        chan.put({
            error: true,
            msg: "Error code: " + error.code,
        });
    });
}

function* watchDownloadContent(download: Download, chan: any): SagaIterator {
    let progress: number = 0;
    let lastTime = new Date();

    while (progress < 100) {
        const payload = yield take(chan);
        const error = payload.error;

        if (error) {
            console.log("## error:", payload.msg);
            yield put(downloaderActions.fail(download, payload.msg));
            return;
        } else {
            const currentTime = new Date();
            let elapsedSeconds = (currentTime.getTime() - lastTime.getTime()) / 1000;
            progress = payload.progress;

            if (elapsedSeconds > 1 || progress === 100) {
                // Do not refresh more than every seconds
                yield put(downloaderActions.progress(download, progress));
                lastTime = currentTime;
            }
        }
    }

    yield put(downloaderActions.finish(download));
}

function* startDownload(download: Download): SagaIterator {
    const chan = yield call(channel);
    yield put(downloaderActions.start(download));
    const downloadTask = yield fork(downloadContent, download, chan);
    const downloadWatcherTask = yield fork(watchDownloadContent, download, chan);

    while (true) {
        const cancelAction = yield take([DOWNLOAD_CANCEL]);

        if (cancelAction.download.identifier === download.identifier) {
            // Close channel before killing tasks
            chan.close();

            // Cancel all tasks specific to the download
            yield cancel(downloadTask);
            yield cancel(downloadWatcherTask);
        }
    }
}

export function* watchDownloadStart(): SagaIterator {
    let buffer: Buffer<any> = buffers.expanding(20);
    let chan = yield actionChannel([DOWNLOAD_ADD], buffer);

    while (true) {
        const addAction = yield take(chan);
        yield fork(startDownload, addAction.download);
    }
}

export function* watchDownloadFinish(): SagaIterator {
    let buffer: Buffer<any> = buffers.expanding(20);
    let chan = yield actionChannel([DOWNLOAD_FINISH], buffer);

    while (true) {
        const action = yield take(chan);
        // FIXME: Rename file: remove .part
        let srcPath: string = action.download.dstPath;
        let dstPath: string = srcPath.substring(
            0,
            srcPath.lastIndexOf(".part"),
        );
        fs.renameSync(srcPath, dstPath);
        action.download.dstPath = dstPath;
    }
}
