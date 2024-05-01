# react-mui-rrule-input
React component using MUI for creating and inputting RRules. Designed to create a user-friendly way of inputting and creating RRules. Uses `rrule`, `date-fns` and `date-fns-tz`.

## Images
![image](https://github.com/totallyrin/react-mui-rrule-input/assets/1056415/20a96ada-e196-43ce-b5e8-f555475093bf) 

![image](https://github.com/totallyrin/react-mui-rrule-input/assets/1056415/5ff5471a-9be4-4342-a95b-6c56faa1ece2)

![image](https://github.com/totallyrin/react-mui-rrule-input/assets/1056415/d3c84394-a886-4296-8a64-6ca23f0d244e)

## Installation
You can install this package using npm:
```bash
npm install react-mui-rrule-input
```
Or yarn:
```bash
yarn add react-mui-rrule-input
```

## Usage
```js
import React, { useState } from 'react';
import RRuleInput from 'rrule-generator-input';

function MyApp() {
  const [displayText, setDisplayText] = useState('');
  const [rrule, setRRule] = useState('');

  return (
    <RRuleInput
      setDisplayText={setDisplayText}
      rrule={rrule}
      setRRule={setRRule}
    />
  );
}

export default MyApp;
```
In the example above, `setDisplayText` and `setRRule` are functions that update the state of your application with the human-readable string and RRULE string generated by the component, respectively.

## Customization
This component accepts a `theme` prop and an `sx` prop which you can use to customize the appearance. Please note that this component uses MUI components, and so any theming or styling will need to follow MUI's style system.
```js
import { createTheme } from '@mui/material/styles';

const myTheme = createTheme({
  palette: {
    primary: {
      main: '#ff0000',
    },
  },
});

<RRuleInput
  setDisplayText={setDisplayText}
  rrule={rrule}
  setRRule={setRRule}
  theme={myTheme}
  sx={{ mt: 2 }}
/>
```
In the example above, the `theme` prop is used to change the primary color of the component to red, and the `sx` prop is used to add a top margin.
