const request = require("supertest");
const app = require("../server"); // assuming your express app is exported

describe("Auth Routes", () => {
	it("should register a new user", async () => {
		const res = await request(app)
			.post("/register")
			.send({ username: "testuser", password: "testpass" });

		expect(res.statusCode).toEqual(302); // because we redirect after register
	});

	it("should fail with invalid credentials", async () => {
		const res = await request(app)
			.post("/login")
			.send({ username: "wrong", password: "wrong" });

		expect(res.text).toContain("Invalid credentials");
	});
});
