import { expect, test } from "@playwright/test";

test.describe("@web", () => {
  for (const path of ["/", "/about", "/note/does-not-exist"]) {
    test(`serves ${path} with status 200`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
    });
  }

  test("api still reports a missing note as 404", async ({ request }) => {
    const response = await request.get("/api/notes/does-not-exist");
    expect(response.status()).toBe(404);
  });
});
