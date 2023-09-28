const streamers = [
  {
    name: "Vinesauce",
    route: "vine",
    supportedRoutes: ["vine", "vinesauce", "vinny"],
    theme: {
      primary: "teal.700",
      accent: "green.600",
      bg: "gray.800",
      text: "white",
      button: {
        bg: "purple.600",
        border: "black",
        text: "white",
        hover: {
          bg: "purple.500",
        },
      },
    },
    channels: [
      { username: "vinesaucefullsauce", channelId: "UC2_IYqb1Tc_8Azh7rByedPA" },
      { username: "vinesauce", channelId: "UCzORJV8l3FWY4cFO8ot-F2w" },
      {
        username: "VinesauceTwitchClips",
        channelId: "UCo03CCLE1x34004iBmjcHnA",
      },
      {
        username: "VinesauceTheExtraSauce",
        channelId: "UCHEVjnU0KXhr-HDrlwoBm2g",
      },
    ],
  },

  {
    name: "Jerma",
    route: "jerma",
    supportedRoutes: ["jerma", "jerma985"],
    theme: {
      primary: "teal.600",
      accent: "red.400",
      bg: "teal.900",
      text: "white",
      button: {
        bg: "cyan.600",
        border: "black",
        text: "black",
        hover: {
          bg: "cyan.500",
        },
      },
    },
    channels: [
      { username: "jerma985", channelId: "UCBQWIBij3ZCUA7YETaTWnIA" },
      { username: "jerma985archive", channelId: "UCfGfdZuYifBYb1fmZcL1JBQ" },
      { username: "jerma985clips", channelId: "UCz9_5DlGyfcIzXxjTa8YqUw" },
    ],
  },
];

export default streamers;
