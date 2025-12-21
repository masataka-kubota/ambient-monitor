import common from "./common.json";
import navigation from "./navigation.json";
import ble from "./screens/ble.json";
import data from "./screens/data.json";
import live from "./screens/live.json";
import settings from "./screens/settings.json";
import wifi from "./screens/wifi.json";

const en = {
  translation: {
    common,
    navigation,
    // tabs
    live, // (index.ts)
    data,
    settings,
    // screens
    ble,
    wifi,
  },
};

export default en;
