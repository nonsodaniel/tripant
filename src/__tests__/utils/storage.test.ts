import { getItem, setItem, removeItem, STORAGE_KEYS } from "@/lib/utils/storage";

// localStorage is available in jsdom environment

beforeEach(() => {
  localStorage.clear();
});

describe("getItem", () => {
  it("returns fallback when key does not exist", () => {
    expect(getItem("nonexistent", null)).toBeNull();
    expect(getItem("nonexistent", [])).toEqual([]);
    expect(getItem("nonexistent", 42)).toBe(42);
  });

  it("returns parsed value when key exists", () => {
    localStorage.setItem("test-key", JSON.stringify({ hello: "world" }));
    expect(getItem("test-key", null)).toEqual({ hello: "world" });
  });

  it("returns fallback when stored value is invalid JSON", () => {
    localStorage.setItem("bad-json", "not valid json {{{");
    expect(getItem("bad-json", "fallback")).toBe("fallback");
  });

  it("returns arrays correctly", () => {
    localStorage.setItem("arr", JSON.stringify([1, 2, 3]));
    expect(getItem("arr", [])).toEqual([1, 2, 3]);
  });

  it("returns strings correctly", () => {
    localStorage.setItem("str", JSON.stringify("hello"));
    expect(getItem("str", "")).toBe("hello");
  });

  it("returns numbers correctly", () => {
    localStorage.setItem("num", JSON.stringify(42));
    expect(getItem("num", 0)).toBe(42);
  });
});

describe("setItem", () => {
  it("stores value as JSON string", () => {
    setItem("key1", { a: 1 });
    expect(localStorage.getItem("key1")).toBe('{"a":1}');
  });

  it("stores arrays as JSON", () => {
    setItem("arr", [1, 2, 3]);
    expect(localStorage.getItem("arr")).toBe("[1,2,3]");
  });

  it("stores null correctly", () => {
    setItem("nullval", null);
    expect(localStorage.getItem("nullval")).toBe("null");
  });

  it("overwrites existing value", () => {
    setItem("key", "first");
    setItem("key", "second");
    expect(getItem("key", "")).toBe("second");
  });
});

describe("removeItem", () => {
  it("removes an existing key", () => {
    setItem("to-remove", "value");
    removeItem("to-remove");
    expect(localStorage.getItem("to-remove")).toBeNull();
  });

  it("does not throw when key does not exist", () => {
    expect(() => removeItem("nonexistent-key")).not.toThrow();
  });
});

describe("STORAGE_KEYS", () => {
  it("has all required keys", () => {
    expect(STORAGE_KEYS.TRIPS).toBe("tripant:trips");
    expect(STORAGE_KEYS.SAVED_PLACES).toBe("tripant:saved_places");
    expect(STORAGE_KEYS.SAVED_LISTS).toBe("tripant:saved_lists");
    expect(STORAGE_KEYS.HISTORY).toBe("tripant:history");
    expect(STORAGE_KEYS.RECENT_SEARCHES).toBe("tripant:recent_searches");
    expect(STORAGE_KEYS.VIEWED_PLACES).toBe("tripant:viewed_places");
    expect(STORAGE_KEYS.LOCATION).toBe("tripant:location");
  });
});
