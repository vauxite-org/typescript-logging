import {hello} from "../main/typescript-logging-core";

describe("Test example", () => {

  it ("Test 1", () => {
    expect(hello()).toEqual("hello!");
  });
});
