import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";

import PersonCard from "./PersonCard";

export default function PeopleList({ users }) {
  return (
    <Flex flexWrap="wrap" mx={-2}>
      {users.map(u => (
        <Box px={1} mx="auto" width={196} key={u.id}>
          <PersonCard user={u} />
        </Box>
      ))}
    </Flex>
  );
}
