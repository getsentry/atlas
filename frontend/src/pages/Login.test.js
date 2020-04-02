import React from "react";
import { fireEvent, screen } from "@testing-library/react";

import Login from "./Login";
import { RouterContext, mockRouter, render, tick } from "../utils/testing";
import { LOGIN_MUTATION } from "../actions/auth";

import apolloClient from "../utils/apollo";

test("can render with redux with defaults", async () => {
  apolloClient.addMock({
    request: {
      query: LOGIN_MUTATION,
      variables: { googleAuthCode: "abcdef" }
    },
    result: {
      data: {
        login: {
          ok: true,
          errors: [],
          token: "gauth-token",
          user: {
            id: "a-uuid",
            email: "jane@example.com",
            name: "jane",
            isSuperuser: false,
            hasOnboarded: true,
            photo: null
          }
        }
      }
    }
  });

  const router = mockRouter();

  const { store } = render(
    <RouterContext router={router}>
      <Login />
    </RouterContext>
  );

  fireEvent.click(screen.getByText("Sign in with Google"));
  // TODO(dcramer): why are we having to tick twice?
  await tick();
  await tick();
  const state = store.getState();
  expect(state.auth.authenticated).toBe(true);
  expect(router.push.mock.calls.length).toBe(1);
  expect(router.push.mock.calls[0][0]).toStrictEqual({ pathname: "/" });
});
