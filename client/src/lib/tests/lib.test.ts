import { getRoleName } from "@/lib";
import { ROLE_GROUPS } from "@/lib/constants";
import { formatClock } from "@/hooks/use-elapsed-timer";

describe("getRoleName", () => {
  it("finds a role in any group", () => {
    expect(getRoleName("junior-software-engineer")).toBe("Junior Software Engineer");
    expect(getRoleName("ceo")).toBe("CEO");
  });

  it("returns an empty string for unknown or missing roles", () => {
    expect(getRoleName("nope")).toBe("");
    expect(getRoleName(null)).toBe("");
  });

  it("has unique role ids across groups", () => {
    const ids = ROLE_GROUPS.flatMap((group) => Object.keys(group.roles));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("formatClock", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(75)).toBe("01:15");
    expect(formatClock(3599)).toBe("59:59");
  });
});
