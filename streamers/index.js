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
      { username: "Jerma985", channelId: "UCK3kaNXbB57CLcyhtccV_yw" },
      { username: "JermaStreamArchive", channelId: "UC2oWuUSd3t3t5O3Vxp4lgAA" },
      {
        username: "SterJermaStreamArchive",
        channelId: "UC4ik7iSQI1DZVqL18t-Tffw",
      },
    ],
  },
];

export default streamers;
