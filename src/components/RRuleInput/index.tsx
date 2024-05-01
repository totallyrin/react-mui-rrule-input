import {
  Box,
  Button,
  createTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Frequency, Options, RRule } from "rrule";
import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { getOrdinalNumber, rruleToReadable } from "@/utils/utils";

const defaultTheme = createTheme();

export default function RRuleInput({
  setDisplayText,
  rrule,
  setRRule,
}: {
  setDisplayText: React.Dispatch<React.SetStateAction<string>>;
  rrule: string;
  setRRule: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatType, setRepeatType] = useState("weekly");
  const [repeatOn, setRepeatOn] = useState<string[]>([]);
  const [ends, setEnds] = useState("never");
  const [startDate, setStartDate] = useState(
    format(fromZonedTime(new Date(), "UTC"), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(
    format(fromZonedTime(new Date(), "UTC"), "yyyy-MM-dd"),
  );
  const [occurrences, setOccurrences] = useState(1);
  const [day, setDay] = useState([1]);
  const [weekday, setWeekday] = useState(0);
  const [freq, setFreq] = useState(1);
  const [monthOption, setMonthOption] = useState(0);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const daysOfWeek = useMemo(
    () => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"],
    [],
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
          : "weekly",
      );
      setRepeatOn(options.byweekday?.map((day) => daysOfWeek[day]) || []);
      setEnds(options.until ? "on" : options.count ? "after" : "never");
      setStartDate(
        options.dtstart
          ? // ? format(utcToZonedTime(options.dtstart, timezone), "yyyy-MM-dd")
            format(toZonedTime(options.dtstart, timezone), "yyyy-MM-dd")
          : "",
      );
      setEndDate(
        options.until
          ? // ? format(utcToZonedTime(options.until, timezone), "yyyy-MM-dd")
            format(toZonedTime(options.until, timezone), "yyyy-MM-dd")
          : "",
      );
      setOccurrences(options.count || 1);
      setDay(
        options.bymonthday && options.bymonthday.length > 0
          ? options.bymonthday
          : [1],
      );
      setWeekday(
        options.freq === RRule.MONTHLY && options.byweekday
          ? options.byweekday[0]
          : 0,
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
      until: ends === "on" ? fromZonedTime(endDate, timezone) : undefined,
      count: ends === "after" ? occurrences : undefined,
      bymonthday:
        repeatType === "monthly" && monthOption === 0 ? day : undefined,
      bysetpos:
        repeatType === "monthly" && monthOption === 1 ? freq : undefined,
      dtstart: fromZonedTime(startDate, timezone),
    };

    const rule = new RRule(options);
    setDisplayText(rruleToReadable(rule.toString()));
    return rule.toString();
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
            setRRule(generateRRule());
          }}
        >
          Save Recurrence Rule
        </Button>
      </Box>
    </ThemeProvider>
  );
}
