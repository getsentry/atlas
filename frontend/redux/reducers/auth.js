import { LOAD_GAPI, LOGIN, LOGOUT } from "../types";

const initialState = {
  authenticated: null,
  token: null,
  gapi: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GAPI:
      return { gapi: action.payload };
    case LOGIN:
      return { token: action.payload, authenticated: true };
    case LOGOUT:
      return { token: null, authenticated: false };
    default:
      return state;
  }
};
