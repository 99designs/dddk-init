import { App, Group } from "dddk";

import rds from "dddk/shared/rds";
import fargate from "dddk/shared/fargate";
import healthcheck from "dddk/shared/healthcheck";
import alb from "dddk/shared/alb";
import team from "../team";
import custom from "../components/custom";

export default new App({
  name: "ExampleApp",
  team: team.fooBars,
  components: [
    Group("Group 1", [healthcheck("http://example.com"), alb("example-app")]),
    Group("Group 2", [
      rds("example-app"),
      fargate("example-app"),
      custom("example-app"),
    ]),
  ],
});
