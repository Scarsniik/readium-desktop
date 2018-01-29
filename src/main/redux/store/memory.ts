import { applyMiddleware, createStore, Store, compose } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";

import { reduxSyncMiddleware } from "readium-desktop/main/redux/middleware/sync";
import { rootReducer } from "readium-desktop/main/redux/reducers";
import { RootState } from "readium-desktop/main/redux/states";
import { rootSaga } from "readium-desktop/main/redux/sagas";

export function initStore(): Store<RootState> {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(reduxSyncMiddleware, sagaMiddleware),
        ),
    );
    sagaMiddleware.run(rootSaga);
    return store as Store<RootState>;
}