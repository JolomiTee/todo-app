describe("Task Routes", () => {
	it("should require authentication", async () => {
		const res = await request(app).get("/tasks");
		expect(res.statusCode).toBe(302); // redirect to login if not authenticated
	});
});
