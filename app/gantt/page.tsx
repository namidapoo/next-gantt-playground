"use client";

import { GanttChart } from "@/components/gantt/GanttChart";

export default function GanttPage() {
	return (
		<main className="min-h-screen bg-gray-50">
			<div className="max-w-full mx-auto p-4">
				<h1 className="text-3xl font-bold mb-4">Gantt Chart</h1>
				<GanttChart />
			</div>
		</main>
	);
}
