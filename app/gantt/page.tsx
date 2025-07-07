"use client";

import { GanttChart } from "@/components/gantt/GanttChart";

export default function GanttPage() {
	return (
		<main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
			<div className="flex-shrink-0 p-4 pb-0">
				<h1 className="text-3xl font-bold mb-4">Gantt Chart</h1>
			</div>
			<div className="flex-1 p-4 pt-0 min-h-0">
				<GanttChart />
			</div>
		</main>
	);
}
