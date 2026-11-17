import { User, AuthContextType } from "../types";

describe("auth types", () => {
  it("describes a user, with an optional admin flag", () => {
    const user: User = {
      id: "1",
      email: "a@b.c",
      name: "A",
      avatar: null,
      role: "ceo",
    };
    expect(user.isAdmin).toBeUndefined();
    expect({ ...user, isAdmin: true }.isAdmin).toBe(true);
  });

  it("describes the auth context", async () => {
    const context: AuthContextType = {
      user: null,
      isLoading: false,
      signInWithGoogle: async () => {},
      logOut: async () => {},
    };
    await expect(context.signInWithGoogle("ceo")).resolves.toBeUndefined();
    expect(context.user).toBeNull();
  });
});
