import React from "react";
import { Box } from "@rebass/grid/emotion";
import IconLink from "./IconLink";
import { AccountTree, RecentActors, TableChart, SportsEsports } from "@material-ui/icons";

export default function PeopleViewSelectors(props) {
  const boxes = [];

  if (props.current !== "people") {
    boxes.push({
      icon: <TableChart />,
      link: "/people",
    });
  }

  if (props.current !== "orgChart") {
    boxes.push({
      icon: <AccountTree />,
      link: "/orgChart",
    });
  }

  if (props.current !== "flashcards") {
    boxes.push({
      icon: <RecentActors />,
      link: "/flashcards",
    });
  }

  if (props.current !== "quiz") {
    boxes.push({
      icon: <SportsEsports />,
      link: "/quiz",
    });
  }

  return boxes.map(({ icon, link }) => {
    return (
      <Box mr={3}>
        <IconLink
          icon={icon}
          to={link}
          style={{ fontSize: "1.3em", marginBottom: "1rem" }}
        />
      </Box>
    );
  });
}
