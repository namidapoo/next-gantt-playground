"use client";

import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { TaskRow } from "./TaskRow";

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
	const { tasks } = useGanttStore();

	return (
		<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200">
			{/* 固定のTasks列 */}
			<div className="divide-y divide-gray-200">
				{tasks.map((task) => (
					<div key={`${task.id}-name`} className="p-3 h-16 flex items-center">
						<div className="font-medium text-sm">{task.name}</div>
					</div>
				))}
			</div>

			{/* スクロール可能なコンテンツ領域 */}
			<div ref={scrollRef} className="overflow-x-hidden" onScroll={onScroll}>
				<div className="min-w-max divide-y divide-gray-200">
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
