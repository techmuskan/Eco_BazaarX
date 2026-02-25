import { getResolvedRole } from "./authService";

beforeEach(() => {
  localStorage.clear();
});

test("getResolvedRole returns role from stored user first", () => {
  localStorage.setItem("user", JSON.stringify({ role: "ADMIN" }));
  expect(getResolvedRole()).toBe("ADMIN");
});

test("getResolvedRole falls back to role from token payload", () => {
  const payload = btoa(JSON.stringify({ role: "USER" }));
  localStorage.setItem("token", `x.${payload}.y`);
  expect(getResolvedRole()).toBe("USER");
});
