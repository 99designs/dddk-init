import { Team } from "dddk";

const team: { [name: string]: Team } = {
  fooBars: {
    alertContact: "@pagerduty-FooBar",
    warningContact: "@slack-foo-bar-dev",
  },
};

export default team;
