import {RRule, rrulestr} from "rrule";
import {format} from "date-fns";

// Helper function to get ordinal number (1st, 2nd, 3rd, etc.)
export function getOrdinalNumber(number: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = number % 100;
  const suffix =
    suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return number.toString() + suffix;
}

export function rruleToReadable(rruleStr: string) {
  const rule = rrulestr(rruleStr);

  let readableStr = "Repeats ";

  switch (rule.options.freq) {
    case RRule.DAILY:
      readableStr +=
        rule.options.interval === 1
          ? "daily "
          : `every ${rule.options.interval} days `;
      break;
    case RRule.WEEKLY:
      readableStr +=
        rule.options.interval === 1
          ? "weekly "
          : `every ${rule.options.interval} weeks `;

      if (rule.options.byweekday) {
        const weekdays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        const selectedDays = rule.options.byweekday.map((day) => weekdays[day]);
        const orderedSelectedDays = weekdays.filter((day) =>
          selectedDays.includes(day),
        );
        readableStr += `on ${orderedSelectedDays.join(", ")} `;
      }
      break;
    case RRule.MONTHLY:
      readableStr +=
        rule.options.interval === 1
          ? "monthly "
          : `every ${rule.options.interval} months `;
      if (rule.options.bymonthday && rule.options.bymonthday.length > 0) {
        readableStr += `on the ${rule.options.bymonthday
          .map((day) => getOrdinalNumber(day))
          .join(", ")} of the month `;
      }
      if (rule.options.bysetpos && rule.options.bysetpos.length > 0) {
        const freq = rule.options.bysetpos[0];
        const frequencies = ["first", "second", "third", "fourth"];
        const weekday = rule.options.byweekday[0];
        const weekdays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

        readableStr += `on the ${freq < 1 ? "last" : frequencies[freq - 1]} ${
          weekdays[weekday]
        } of the month `;
      }
      break;
  }
  if (rule.options.count) {
    readableStr += `for ${rule.options.count} ${
      rule.options.count === 1 ? "occurrence" : "occurrences"
    } `;
  }
  if (rule.options.dtstart) {
    readableStr += `starting ${format(rule.options.dtstart, "yyyy-MM-dd")} `;
  }

  if (rule.options.until) {
    readableStr += `until ${format(rule.options.until, "yyyy-MM-dd")} `;
  }
  return readableStr;
}
