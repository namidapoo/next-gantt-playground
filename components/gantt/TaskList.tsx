"use client";

import { useGanttStore } from "@/lib/stores/gantt.store";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
	dates: Date[];
	startDate: Date;
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
}

export function TaskList({ dates, startDate, onPeriodSelect }: TaskListProps) {
	const { tasks } = useGanttStore();

	return (
		<div className="divide-y divide-gray-200">
			{tasks.map((task) => (
				<TaskRow
					key={task.id}
					task={task}
					dates={dates}
					startDate={startDate}
					onPeriodSelect={onPeriodSelect}
				/>
			))}
		</div>
	);
}
