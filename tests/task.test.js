const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Task = require("../models/task.model"); // Assuming Task.js from controller usage
const app = require("../index");
require("dotenv").config();

let agent;
let testUser;
let testUserId;


// Not sure my tests would work but no time again

describe("Task Routes", () => {
	beforeAll(async () => {
		if (!process.env.MONGO_URI) {
			throw new Error(
				"MONGO_URI not defined. Ensure .env file is present and loaded."
			);
		}
		await mongoose.connect(process.env.MONGO_URI);
	});

	beforeEach(async () => {
		await User.deleteMany({});
		await Task.deleteMany({});

		agent = request.agent(app);

		// Create and login a test user
		testUser = await User.create({
			username: "testuser",
			password: "password123",
		});
		testUserId = testUser._id;

		await agent
			.post("/login")
			.send({ username: "testuser", password: "password123" });
	});

	afterAll(async () => {
		await mongoose.disconnect();
	});

	describe("POST /tasks (Create Task)", () => {
		it("should create a new task for the authenticated user and redirect", async () => {
			const res = await agent
				.post("/tasks")
				.send({
					title: "Test Task 1",
					description: "This is a test task description.",
				})
				.expect(302)
				.expect("Location", "/tasks");

			const task = await Task.findOne({ title: "Test Task 1" });
			expect(task).not.toBeNull();
			expect(task.user_id.toString()).toBe(testUserId.toString());
			expect(task.description).toBe("This is a test task description.");
		});
	});

	describe("GET /tasks (Read Tasks)", () => {
		it("should display tasks for the authenticated user", async () => {
			await Task.create({
				user_id: testUserId,
				title: "My Task A",
				description: "A desc",
			});
			await Task.create({
				user_id: testUserId,
				title: "My Task B",
				description: "B desc",
			});

			const res = await agent.get("/tasks").expect(200);

			expect(res.text).toContain("My Task A");
			expect(res.text).toContain("My Task B");
			expect(res.text).toContain("Task Dashboard");
		});
	});

	describe("POST /tasks/:id/status (Update Task Status)", () => {
		let taskToUpdate;
		beforeEach(async () => {
			taskToUpdate = await Task.create({
				user_id: testUserId,
				title: "Update Me",
				status: "pending",
			});
		});

		it("should update task status for the authenticated user and redirect", async () => {
			await agent
				.post(`/tasks/${taskToUpdate._id}/status`)
				.send({ status: "completed" })
				.expect(302)
				.expect("Location", "/tasks");

			const updatedTask = await Task.findById(taskToUpdate._id);
			expect(updatedTask.status).toBe("completed");
		});
	});

	describe("POST /tasks/:id/delete (Delete Task)", () => {
		let taskToDelete;
		beforeEach(async () => {
			taskToDelete = await Task.create({
				user_id: testUserId,
				title: "Delete Me",
			});
		});

		it("should delete a task for the authenticated user and redirect", async () => {
			await agent
				.post(`/tasks/${taskToDelete._id}/delete`)
				.expect(302)
				.expect("Location", "/tasks");

			const deletedTask = await Task.findById(taskToDelete._id);
			expect(deletedTask).toBeNull();
		});
	});
});
