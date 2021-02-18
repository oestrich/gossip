import {
  Filter,
  Media,
  validKey,
  validName,
  validPriority,
  validTag,
  validType,
  validUrl,
} from "./mediaReducer";

describe("validating", () => {
  test("validates name", () => {
    expect(validName("file.mp3")).toEqual(true);
    expect(validName("file.ogg")).toEqual(false);
    expect(validName("anything else")).toEqual(false);
  });

  test("validates type", () => {
    expect(validType("music")).toEqual(true);
    expect(validType("sound")).toEqual(true);
    expect(validType("anything else")).toEqual(false);
  });

  test("validates tag", () => {
    expect(validTag("combat")).toEqual(true);
    expect(validTag(10)).toEqual(false);
  });

  test("validates priority", () => {
    expect(validPriority(50)).toEqual(true);
    expect(validPriority(1)).toEqual(true);
    expect(validPriority(100)).toEqual(true);
    expect(validPriority(-1)).toEqual(false);
    expect(validPriority("anything else")).toEqual(false);
  });

  test("validates key", () => {
    expect(validKey("a key")).toEqual(true);
    expect(validKey(1)).toEqual(false);
  });

  test("validates url", () => {
    expect(validUrl("http://example.com/")).toEqual(true);
    expect(validUrl("https://example.com/")).toEqual(true);
    expect(validUrl("ftp://example.com/")).toEqual(false);
    expect(validUrl("anything else")).toEqual(false);
  });
});

describe("filters match", () => {
  test("matches based on key", () => {
    let filter = new Filter({key: "ambient"});
    expect(filter.matches(new Filter({key: "ambient"}))).toEqual(true);

    filter = new Filter({key: "ambient"});
    expect(filter.matches(new Filter({key: "other"}))).toEqual(false);
  });

  test("matches based on name", () => {
    let filter = new Filter({name: "file.mp3"});
    expect(filter.matches({name: "file.mp3"})).toEqual(true);

    filter = new Filter({name: "file.mp3"});
    expect(filter.matches({name: "other.mp3"})).toEqual(false);
  });

  test("matches based on type", () => {
    let filter = new Filter({type: "music"});
    expect(filter.matches({type: "music"})).toEqual(true);

    filter = new Filter({type: "music"});
    expect(filter.matches({type: "sound"})).toEqual(false);
  });

  test("matches based on tag", () => {
    let filter = new Filter({tag: "background"});
    expect(filter.matches({tag: "background"})).toEqual(true);

    filter = new Filter({tag: "background"});
    expect(filter.matches({tag: "foreground"})).toEqual(false);
  });

  test("matches based on priority", () => {
    let filter = new Filter({priority: 50});
    expect(filter.matches({priority: 50})).toEqual(true);

    filter = new Filter({priority: 50});
    expect(filter.matches({priority: 65})).toEqual(true);

    filter = new Filter({priority: 50});
    expect(filter.matches({priority: 25})).toEqual(false);
  });

  test("matches based on combinations", () => {
    let filter = new Filter({tag: "background", priority: 50});
    expect(filter.matches({tag: "background", priority: 65})).toEqual(true);

    filter = new Filter({type: "music", priority: 50});
    expect(filter.matches({type: "music", priority: 35})).toEqual(false);

    filter = new Filter({type: "music", priority: 50});
    expect(filter.matches({key: "background"})).toEqual(false);

    filter = new Filter({type: "music", priority: 50});
    expect(filter.matches({priority: 65})).toEqual(true);
  });
});

describe("media class - file url", () => {
  test("uses the default url to construct the url", () => {
    let media = new Media({name: "file.mp3"}, {url: "https://example.com/"});
    expect(media.url).toEqual("https://example.com/file.mp3");
  });

  test("includes a trailing slash automatically", () => {
    let media = new Media({name: "file.mp3"}, {url: "https://example.com"});
    expect(media.url).toEqual("https://example.com/file.mp3");
  });

  test("uses the specific url if provided", () => {
    let media = new Media({name: "file.mp3", url: "https://example.com"});
    expect(media.url).toEqual("https://example.com/file.mp3");
  });

  test("ignores invalid urls", () => {
    expect(() => {
      new Media({name: "file.mp3"}, {url: "ftp://example.com/"});
    }).toThrowError(/Music/);
  });
});
