import { jest } from "@jest/globals";

const invited = new Set(["guest@example.com"]);

jest.unstable_mockModule("../src/config.js", () => ({
  getAdminEmail: () => "admin@example.com",
}));
jest.unstable_mockModule("../src/services/invitation-service.js", () => ({
  isInvited: async (email) => invited.has(email),
}));

const { identify, requireAccess, requireAdmin, normalizeEmail } = await import("../src/access.js");

const asUser = (email, verified = true) => ({ auth: { token: { email, email_verified: verified, name: "N" } } });

describe("access control", () => {
  it("normalizes emails", () => {
    expect(normalizeEmail("  Guest@Example.COM ")).toBe("guest@example.com");
    expect(normalizeEmail(undefined)).toBe("");
  });

  it("rejects unauthenticated and unverified callers", async () => {
    await expect(requireAccess({})).rejects.toMatchObject({ code: "unauthenticated" });
    await expect(requireAccess(asUser("guest@example.com", false))).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("lets invited users in, case-insensitively", async () => {
    await expect(requireAccess(asUser("Guest@Example.com"))).resolves.toMatchObject({
      email: "guest@example.com",
      isAdmin: false,
    });
  });

  it("blocks users that were not invited", async () => {
    await expect(requireAccess(asUser("stranger@example.com"))).rejects.toMatchObject({
      code: "permission-denied",
    });
    expect(await identify(asUser("stranger@example.com"))).toMatchObject({ allowed: false });
  });

  it("always allows the admin and restricts admin actions to them", async () => {
    await expect(requireAccess(asUser("admin@example.com"))).resolves.toMatchObject({ isAdmin: true });
    await expect(requireAdmin(asUser("admin@example.com"))).resolves.toBeTruthy();
    await expect(requireAdmin(asUser("guest@example.com"))).rejects.toMatchObject({
      code: "permission-denied",
    });
  });
});
