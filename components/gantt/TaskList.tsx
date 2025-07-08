"use client";

import React from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { TaskRow } from "./TaskRow";
import { TaskNameEditor } from "./TaskNameEditor";

interface TaskListProps {
	dates: Date[];
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	onPeriodEdit?: (period: Period) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function TaskList({
	dates,
	onPeriodSelect,
	onPeriodEdit,
	scrollRef,
	onScroll,
}: TaskListProps) {
	const { tasks, setEditingTaskId, editingTaskId } = useGanttStore();

	const handleTaskClick = (taskId: string) => {
		if (editingTaskId !== taskId) {
			setEditingTaskId(taskId);
		}
	};

	const handleEditFinish = () => {
		setEditingTaskId(null);
	};

	return (
		<div ref={scrollRef} className="overflow-x-hidden" onScroll={onScroll}>
			<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200 min-w-max">
				{/* Tasks列 */}
				<div className="divide-y divide-gray-200">
					{tasks.map((task) => (
						<div key={`${task.id}-name`} className="p-3 h-16 flex items-center">
							{editingTaskId === task.id ? (
								<TaskNameEditor
									taskId={task.id}
									initialName={task.name}
									onFinish={handleEditFinish}
								/>
							) : (
								<div
									className="font-medium text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded w-full"
									onClick={() => handleTaskClick(task.id)}
								>
									{task.name}
								</div>
							)}
						</div>
					))}
				</div>

				{/* スケジュール列 */}
				<div className="divide-y divide-gray-200">
					{tasks.map((task) => (
						<TaskRow
							key={task.id}
							task={task}
							dates={dates}
							onPeriodSelect={onPeriodSelect}
							onPeriodEdit={onPeriodEdit}
							scrollRef={scrollRef}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
