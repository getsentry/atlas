import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Person from "./Person";
import { RouterContext, mocks, mockRouter, render, tick } from "../utils/testing";
import { GET_PERSON_QUERY } from "../queries";

import apolloClient from "../utils/apollo";

test("can render valid profile as non-superuser", async () => {
  apolloClient.addMockedResponse({
    request: {
      query: GET_PERSON_QUERY,
      variables: {
        email: "jane@example.com",
        humansOnly: false,
        includeHidden: false
      }
    },
    result: {
      data: {
        users: {
          results: [
            mocks.User({
              email: "jane@example.com",
              name: "Jane Doe",
              isSuperuser: false
            })
          ]
        }
      }
    }
  });

  const router = mockRouter();

  const currentUser = {
    id: "a-uuid",
    email: "jane@example.com",
    name: "Jane Doe",
    isSuperuser: false,
    hasOnboarded: true,
    photo: null
  };

  render(
    <RouterContext router={router}>
      <Person email="jane@example.com" />
    </RouterContext>,
    {
      initialState: {
        auth: {
          user: currentUser
        }
      }
    }
  );

  await tick();
  await tick();

  expect(screen.getByTestId("name")).toHaveTextContent("Jane Doe");
});
