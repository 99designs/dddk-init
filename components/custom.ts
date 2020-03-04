import { Component } from "dddk";
import { cpuStyle } from 'dddk/shared/styles';

export default function custom(aTag: string): Component {
  return container => {
    // Add a widget to your dashboard using addWidget.
    //
    // This uses a typescript discriminated unions to make that we send all the requried properties to datadog.
    // Try changing type to slo and watch the compiler complain about all the missing fields.
    container.addWidget("Example widget", {
      type: "timeseries",
      requests: [
        {
          q: `avg:some.custom.metric{a_tag:${aTag}} by {foo})`,
          display_type: "line",
          style: cpuStyle,
        },
      ],
    });

    // Add a monitor that that reports via the teams warning contact. This lets the team know something is unhappy but
    // isn't considered urgent.
    container.addWarningMonitor(
      `Hey look at me, something silly is going on with ${aTag}`,
      {
        type: "query alert",
        query: `avg(last_15m):avg:some.custom.metric{a_tag:${aTag}} by {foo} > 80`,
        message: `
          {{#is_alert}}
            This message will be shown to someone when the monitor goes off.
          {{/is_alert}}

          {{#is_recovery}}
            This message will be shown when the monitor recovers
          {{/is_recovery}}
        `,
        options: {
          include_tags: false,
          thresholds: {
            critical: 80,
            critical_recovery: 70,
          },
        },
      },
    );

    // Add a monitor that that reports via the teams outage contact. This lets the team know something is DOWN.
    // These monitors also contribute towards SLOs.
    container.addOutageMonitor(
      `${aTag} is out of icecream`,
      {
        type: "query alert",
        query: `avg(last_15m):avg:some.custom.metric{a_tag:${aTag}} by {foo} > 80`,
        message: `
          {{#is_alert}}
            This message will be shown to someone when the alert goes off. Be sure to write the kind of clear
            message you would want to read at 3 in the morning when everything is on fire.
          {{/is_alert}}

          {{#is_recovery}}
            This message will be shown when the monitor recovers
          {{/is_recovery}}
        `,
        options: {
          include_tags: false,
          thresholds: {
            critical: 80,
            critical_recovery: 70,
          },
        },
      },
    );

    // Synthetics are used to periodically test if a host is up. They are called from around the world in the regions
    // configured below.
    const url = `https://example.com/${aTag}/status`;
    container.addSynthetic(`Synthetic for ${aTag}`, {
      message: `Unable to reach ${url}, are you sure ${aTag} is up?`,
      type: "api",
      config: {
        assertions: [{ type: "statusCode", operator: "is", target: 200 }],
        request: {
          method: "GET",
          url: url,
          timeout: 30,
          port: 443,
        },
      },
      locations: ["aws:ap-northeast-1", "aws:us-east-2", "aws:eu-west-1"],
      options: {
        tick_every: 60,
        min_failure_duration: 90,
        min_location_failed: 1,
      },
    });
  }
}
