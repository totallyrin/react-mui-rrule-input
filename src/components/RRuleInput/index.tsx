import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Frequency, Options, RRule, rrulestr } from "rrule";
import { format } from "date-fns";
import {
  // utcToZonedTime, zonedTimeToUtc,
  fromZonedTime, toZonedTime } from "date-fns-tz";

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
          selectedDays.includes(day)
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

// Helper function to get ordinal number (1st, 2nd, 3rd, etc.)
function getOrdinalNumber(number: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = number % 100;
  const suffix =
    suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return number.toString() + suffix;
}

type RecurringSectionProps = {
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;
  rrule: string;
  setRRule: React.Dispatch<React.SetStateAction<string>>;
};

export default function RRuleInput({
  setDisplayText,
  rrule,
  setRRule,
}: RecurringSectionProps) {
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatType, setRepeatType] = useState("weekly");
  const [repeatOn, setRepeatOn] = useState<string[]>([]);
  const [ends, setEnds] = useState("never");
  const [startDate, setStartDate] = useState(
    // format(zonedTimeToUtc(new Date(), "UTC"), "yyyy-MM-dd")
    format(fromZonedTime(new Date(), "UTC"), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState("");
  const [occurrences, setOccurrences] = useState(1);
  const [day, setDay] = useState([1]);
  const [weekday, setWeekday] = useState(0);
  const [freq, setFreq] = useState(1);
  const [monthOption, setMonthOption] = useState(0);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const daysOfWeek = useMemo(
    () => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
    []
  );

  // Function to get the frequency based on setpos (e.g., "First", "Second", ...)
  const getFreqBySetpos = (setpos: number) => {
    switch (setpos) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Third";
      case 4:
        return "Fourth";
      default:
        return "Last";
    }
  };

  const getFrequencyType = (freq: number): string => {
    // Map the frequency number to the corresponding type
    switch (freq) {
      case 0:
        return "yearly";
      case 1:
        return "monthly";
      case 2:
        return "weekly";
      case 3:
        return "daily";
      case 4:
        return "hourly";
      case 5:
        return "minutely";
      case 6:
        return "secondly";
      default:
        return "weekly";
    }
  };

  useEffect(() => {
    if (rrule && rrule !== "") {
      const { options } = RRule.fromString(rrule);

      setRepeatEvery(options.interval || 1);
      setRepeatType(
        typeof options.freq === "number"
          ? getFrequencyType(options.freq)
          : "weekly"
      );
      setRepeatOn(options.byweekday?.map((day) => daysOfWeek[day]) || []);
      setEnds(options.until ? "on" : options.count ? "after" : "never");
      setStartDate(
        options.dtstart
          // ? format(utcToZonedTime(options.dtstart, timezone), "yyyy-MM-dd")
          ? format(toZonedTime(options.dtstart, timezone), "yyyy-MM-dd")
          : ""
      );
      setEndDate(
        options.until
          // ? format(utcToZonedTime(options.until, timezone), "yyyy-MM-dd")
          ? format(toZonedTime(options.until, timezone), "yyyy-MM-dd")
          : ""
      );
      setOccurrences(options.count || 1);
      setDay(
        options.bymonthday && options.bymonthday.length > 0
          ? options.bymonthday
          : [1]
      );
      setWeekday(
        options.freq === RRule.MONTHLY && options.byweekday
          ? options.byweekday[0]
          : 0
      );
      setFreq(options.bysetpos?.length > 0 ? options.bysetpos[0] : 1);
      setMonthOption(options.bysetpos?.length > 0 ? 1 : 0);
    }
  }, [daysOfWeek, rrule, timezone]);

  const generateRRule = () => {
    const options: Partial<Options> = {
      freq: Frequency[repeatType.toUpperCase() as keyof typeof Frequency],
      interval: repeatEvery,
      byweekday:
        repeatType === "weekly"
          ? repeatOn.length
            ? repeatOn.map((day) => daysOfWeek.indexOf(day))
            : undefined
          : repeatType === "monthly"
          ? [weekday]
          : undefined,
      // until: ends === "on" ? zonedTimeToUtc(endDate, timezone) : undefined,
      until: ends === "on" ? fromZonedTime(endDate, timezone) : undefined,
      count: ends === "after" ? occurrences : undefined,
      bymonthday:
        repeatType === "monthly" && monthOption === 0 ? day : undefined,
      bysetpos:
        repeatType === "monthly" && monthOption === 1 ? freq : undefined,
      // dtstart: zonedTimeToUtc(startDate, timezone),
      dtstart: fromZonedTime(startDate, timezone),
      // tzid: Intl.DateTimeFormat().resolvedOptions().timeZone, // "America/New_York",
    };

    const rule = new RRule(options);
    setDisplayText(rruleToReadable(rule.toString()));
    // setDisplayText(rule.toText());
    return rule.toString();
  };

  return (
    <>
      <Box
        sx={{
          pt: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <FormControl>
          <InputLabel shrink sx={{ ml: -1 }}>
            Starts
          </InputLabel>
          <TextField
            sx={{ mt: 1 }}
            size="small"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormControl>
        <FormControl sx={{ mt: 1 }}>
          <InputLabel sx={{ ml: -1 }}>Repeat every</InputLabel>
          <Box
            sx={{
              pt: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
            }}
          >
            <TextField
              size="small"
              type="number"
              value={repeatEvery}
              onChange={(e) => setRepeatEvery(Number(e.target.value))}
              sx={{ maxWidth: "100px" }}
            />
            <Select
              size="small"
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
            >
              <MenuItem value="daily">
                {repeatEvery === 1 ? "Day" : "Days"}
              </MenuItem>
              <MenuItem value="weekly">
                {repeatEvery === 1 ? "Week" : "Weeks"}
              </MenuItem>
              <MenuItem value="monthly">
                {repeatEvery === 1 ? "Month" : "Months"}
              </MenuItem>
            </Select>
          </Box>
        </FormControl>
        {repeatType === "weekly" && (
          <ToggleButtonGroup
            value={repeatOn}
            onChange={(e, selection: string[]) => {
              if (selection.length) {
                setRepeatOn(selection);
              }
            }}
          >
            {daysOfWeek.map((day) => (
              <ToggleButton key={day} value={day}>
                {day}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {repeatType === "monthly" && (
          <RadioGroup
            value={monthOption}
            onChange={(e) => setMonthOption(Number(e.target.value))}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
              }}
            >
              <Radio value={0} />
              <Typography>On the</Typography>{" "}
              <Select
                size="small"
                multiple
                value={day}
                onChange={(e) => {
                  setDay(e.target.value as number[]);
                }}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                {Array(31)
                  .fill(0)
                  .map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {getOrdinalNumber(i + 1)}
                    </MenuItem>
                  ))}
              </Select>
              {""}
              <Typography>{`day${
                day.length > 1 ? "s" : ""
              } of the month`}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
              }}
            >
              <Radio value={1} />
              <Typography>On the</Typography>{" "}
              <Select
                size="small"
                value={freq}
                onChange={(e) => {
                  setFreq(Number(e.target.value));
                }}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                {[1, 2, 3, 4, -1].map((i) => (
                  <MenuItem key={i} value={i}>
                    {getFreqBySetpos(i)}
                  </MenuItem>
                ))}
              </Select>
              <Select
                size="small"
                value={weekday}
                onChange={(e) => {
                  setWeekday(Number(e.target.value));
                }}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((val, i) => (
                  <MenuItem key={val} value={i}>
                    {val}
                  </MenuItem>
                ))}
              </Select>
              {""}
              <Typography>of the month</Typography>
            </Box>
          </RadioGroup>
        )}
        <FormControl sx={{ mt: 1 }}>
          <InputLabel sx={{ ml: -1 }}>Ends</InputLabel>
          <Box
            sx={{
              pt: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
            }}
          >
            <Select
              size="small"
              value={ends}
              onChange={(e) => setEnds(e.target.value)}
            >
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="on">On</MenuItem>
              <MenuItem value="after">After</MenuItem>
            </Select>
            {ends === "on" && (
              <TextField
                size="small"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            )}
            {ends === "after" && (
              <>
                <TextField
                  size="small"
                  type="number"
                  value={occurrences}
                  onChange={(e) => setOccurrences(Number(e.target.value))}
                  sx={{ maxWidth: "100px" }}
                />
                <Typography>Ocurrences</Typography>
              </>
            )}
          </Box>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            // console.log(generateRRule());
            setRRule(generateRRule());
          }}
        >
          Save Recurrence Rule
        </Button>
      </Box>
    </>
  );
}
