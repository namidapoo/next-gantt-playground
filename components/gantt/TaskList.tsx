"use client";

import { useGanttStore } from "@/lib/stores/gantt.store";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
	dates: Date[];
	startDate: Date;
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function TaskList({
	dates,
	startDate,
	onPeriodSelect,
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
							startDate={startDate}
							onPeriodSelect={onPeriodSelect}
							scrollRef={scrollRef}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
