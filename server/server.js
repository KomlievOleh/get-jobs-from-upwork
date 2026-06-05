import express from "express";
import cors from "cors";
import { getUpworkJobs } from "./upworkPlaywright.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/upwork/jobs", async (req, res) => {
    try {
        const jobs = await getUpworkJobs(req.body);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});

