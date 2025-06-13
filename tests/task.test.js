const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task"); // Assuming Task.js from controller usage
const app = require("../index");
require("dotenv").config();

let agent;
let testUser;
let testUserId;

describe("Task Routes", () => {
	beforeAll(async () => {
		if (!process.env.MONGO_URI) {
			throw new Error("MONGO_URI not defined. Ensure .env file is present and loaded.");
		}
		await mongoose.connect(process.env.MONGO_URI);
	});

	beforeEach(async () => {
		await User.deleteMany({});
		await Task.deleteMany({});

		agent = request.agent(app);

		// Create and login a test user
		testUser = await User.create({ username: 'testuser', password: 'password123' });
		testUserId = testUser._id;

		await agent
			.post('/login')
			.send({ username: 'testuser', password: 'password123' });
	});

	afterAll(async () => {
		await mongoose.disconnect();
	});

	describe("POST /tasks (Create Task)", () => {
		it("should create a new task for the authenticated user and redirect", async () => {
			const res = await agent
				.post("/tasks")
				.send({ title: "Test Task 1", description: "This is a test task description." })
				.expect(302)
				.expect("Location", "/tasks");

			const task = await Task.findOne({ title: "Test Task 1" });
			expect(task).not.toBeNull();
			expect(task.user_id.toString()).toBe(testUserId.toString());
			expect(task.description).toBe("This is a test task description.");
		});

		it("should fail to create a task if title is missing and return 400", async () => {
			const res = await agent
				.post("/tasks")
				.send({ description: "Missing title here." })
				.expect(400); // Mongoose validation error via errorHandler

			expect(res.text).toContain("Validation Error");
			expect(res.text).toContain("Path `title` is required");
		});

		it("should fail to create a task if unauthenticated and redirect to login", async () => {
			await request(app) // New unauthenticated agent
				.post("/tasks")
				.send({ title: "Unauth Task Attempt" })
				.expect(302)
				.expect("Location", "/login");
		});
	});

	describe("GET /tasks (Read Tasks)", () => {
		it("should display tasks for the authenticated user", async () => {
			await Task.create({ user_id: testUserId, title: "My Task A", description: "A desc" });
			await Task.create({ user_id: testUserId, title: "My Task B", description: "B desc" });

			const res = await agent
				.get("/tasks")
				.expect(200);

			expect(res.text).toContain("My Task A");
			expect(res.text).toContain("My Task B");
			expect(res.text).toContain("Task Dashboard");
		});

		it("should display a message if no tasks exist for the authenticated user", async () => {
			const res = await agent
				.get("/tasks")
				.expect(200);

			expect(res.text).toContain("You have no tasks"); // Based on dashboard.ejs
		});

		it("should fail to get tasks if unauthenticated and redirect to login", async () => {
			await request(app)
				.get("/tasks")
				.expect(302)
				.expect("Location", "/login");
		});
	});

	describe("POST /tasks/:id/status (Update Task Status)", () => {
		let taskToUpdate;
		beforeEach(async () => {
			taskToUpdate = await Task.create({ user_id: testUserId, title: "Update Me", status: "pending" });
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

		it("should return 404 if task to update is not found", async () => {
			const invalidTaskId = new mongoose.Types.ObjectId();
			const res = await agent
				.post(`/tasks/${invalidTaskId}/status`)
				.send({ status: "completed" })
				.expect(404);
			// The controller has: return res.status(404).send("Task not found or not authorized");
			expect(res.text).toContain("Task not found or not authorized");
		});

        it("should not update task of another user", async () => {
            const otherUser = await User.create({ username: 'otheruser', password: 'password123' });
            const otherTask = await Task.create({ user_id: otherUser._id, title: "Other's Task", status: "pending" });

            await agent
                .post(`/tasks/${otherTask._id}/status`)
                .send({ status: "completed" })
                .expect(404); // Or 403, controller returns 404 if task not found for logged in user

            const notUpdatedTask = await Task.findById(otherTask._id);
            expect(notUpdatedTask.status).toBe("pending");
        });

		it("should fail to update task status if unauthenticated and redirect to login", async () => {
			await request(app)
				.post(`/tasks/${taskToUpdate._id}/status`)
				.send({ status: "completed" })
				.expect(302)
				.expect("Location", "/login");
		});
	});

	describe("POST /tasks/:id/delete (Delete Task)", () => {
		let taskToDelete;
		beforeEach(async () => {
			taskToDelete = await Task.create({ user_id: testUserId, title: "Delete Me" });
		});

		it("should delete a task for the authenticated user and redirect", async () => {
			await agent
				.post(`/tasks/${taskToDelete._id}/delete`)
				.expect(302)
				.expect("Location", "/tasks");

			const deletedTask = await Task.findById(taskToDelete._id);
			expect(deletedTask).toBeNull();
		});

		it("should return 404 if task to delete is not found", async () => {
			const invalidTaskId = new mongoose.Types.ObjectId();
			const res = await agent
				.post(`/tasks/${invalidTaskId}/delete`)
				.expect(404);
			expect(res.text).toContain("Task not found or not authorized");
		});

        it("should not delete task of another user", async () => {
            const otherUser = await User.create({ username: 'otheruser2', password: 'password123' });
            const otherTask = await Task.create({ user_id: otherUser._id, title: "Other's Task 2" });

            await agent
                .post(`/tasks/${otherTask._id}/delete`)
                .expect(404); // Controller returns 404 if task not found for logged in user

            const notDeletedTask = await Task.findById(otherTask._id);
            expect(notDeletedTask).not.toBeNull();
        });

		it("should fail to delete task if unauthenticated and redirect to login", async () => {
			await request(app)
				.post(`/tasks/${taskToDelete._id}/delete`)
				.expect(302)
				.expect("Location", "/login");
		});
	});
});
