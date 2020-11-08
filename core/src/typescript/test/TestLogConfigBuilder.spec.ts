import {LogConfigBuilder} from "../main/api/config/LogConfigBuilder";

describe("Test LogConfig", () => {

  it ("Test create with defaults", () => {
    const cfg = LogConfigBuilder.create().finish();
  });
});

