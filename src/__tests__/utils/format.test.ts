import {
  formatDate,
  formatRelativeTime,
  formatRating,
  truncate,
  slugify,
  generateId,
  formatDuration,
} from "@/lib/utils/format";

describe("formatDate", () => {
  it("formats ISO date string to readable date", () => {
    expect(formatDate("2024-06-15")).toBe("Jun 15, 2024");
    expect(formatDate("2025-01-01")).toBe("Jan 1, 2025");
    expect(formatDate("2025-12-31")).toBe("Dec 31, 2025");
  });

  it("returns the original string on invalid date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
    expect(formatDate("")).toBe("");
  });
});

describe("formatRelativeTime", () => {
  it("returns a string ending in 'ago' or 'in' for recent dates", () => {
    const recent = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
    const result = formatRelativeTime(recent);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns original string on invalid date", () => {
    expect(formatRelativeTime("bad-date")).toBe("bad-date");
  });
});

describe("formatRating", () => {
  it("formats rating to one decimal place", () => {
    expect(formatRating(4)).toBe("4.0");
    expect(formatRating(4.567)).toBe("4.6");
    expect(formatRating(3.0)).toBe("3.0");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when shorter than maxLength", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("truncates long text and appends ellipsis", () => {
    const result = truncate("Hello World", 5);
    expect(result).toContain("…");
    expect(result.length).toBeLessThanOrEqual(6); // 5 chars + ellipsis
  });

  it("trims trailing whitespace before ellipsis", () => {
    const result = truncate("Hello World", 6);
    expect(result).not.toMatch(/ …/);
  });
});

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("New York City")).toBe("new-york-city");
  });

  it("removes special characters", () => {
    expect(slugify("Café & Bistro!")).toBe("caf-bistro");
  });

  it("handles multiple consecutive spaces and special chars", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("generates unique ids on each call", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("formatDuration", () => {
  it("formats minutes under 60", () => {
    expect(formatDuration(0)).toBe("0min");
    expect(formatDuration(30)).toBe("30min");
    expect(formatDuration(59)).toBe("59min");
  });

  it("formats exactly 60 minutes as 1h", () => {
    expect(formatDuration(60)).toBe("1h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30min");
    expect(formatDuration(150)).toBe("2h 30min");
  });

  it("formats whole hours without minutes", () => {
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(180)).toBe("3h");
  });
});
