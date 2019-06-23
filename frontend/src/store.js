import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose } from "redux";

import reducer from "./reducers";

export const initStore = (initialState = {}) => {
  return createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(thunk),
      window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
    )
  );
};

export default initStore();
