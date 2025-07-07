"use client";

import { differenceInDays, format } from "date-fns";
import { useRef, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Task } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { DateRange } from "./DateRange";

interface TaskRowProps {
	task: Task;
	dates: Date[];
	startDate: Date;
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
}

export function TaskRow({
	task,
	dates,
	startDate,
	onPeriodSelect,
}: TaskRowProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<number | null>(null);
	const [dragEnd, setDragEnd] = useState<number | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const { getTagById } = useGanttStore();

	const handleMouseDown = (index: number) => {
		setIsDragging(true);
		setDragStart(index);
		setDragEnd(index);
	};

	const handleMouseMove = (index: number) => {
		if (isDragging && dragStart !== null) {
			setDragEnd(index);
		}
	};

	const handleMouseUp = () => {
		if (isDragging && dragStart !== null && dragEnd !== null) {
			const start = Math.min(dragStart, dragEnd);
			const end = Math.max(dragStart, dragEnd);

			const period = {
				taskId: task.id,
				startDate: format(dates[start], "yyyy-MM-dd"),
				endDate: format(dates[end], "yyyy-MM-dd"),
			};

			onPeriodSelect(period);
		}

		setIsDragging(false);
		setDragStart(null);
		setDragEnd(null);
	};

	const isDateInPreview = (index: number) => {
		if (!isDragging || dragStart === null || dragEnd === null) return false;
		const start = Math.min(dragStart, dragEnd);
		const end = Math.max(dragStart, dragEnd);
		return index >= start && index <= end;
	};

	return (
		<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200">
			<div className="p-3 flex items-center">
				<div className="font-medium text-sm">{task.name}</div>
			</div>

			<section
				ref={gridRef}
				className="relative h-16 select-none"
				onMouseLeave={() => {
					if (isDragging) {
						handleMouseUp();
					}
				}}
				onMouseUp={handleMouseUp}
				aria-label="Period selection grid"
			>
				<div className="absolute inset-0 flex">
					{dates.map((date, index) => {
						const dateString = format(date, "yyyy-MM-dd");
						const isToday = dateString === format(new Date(), "yyyy-MM-dd");
						const isWeekend = date.getDay() === 0 || date.getDay() === 6;
						const isPreview = isDateInPreview(index);

						return (
							<div
								key={`${task.id}-${dateString}`}
								className={cn(
									"flex-shrink-0 w-10 h-full border-r border-gray-200 cursor-pointer",
									isWeekend && !isPreview && "bg-gray-50",
									isToday && !isPreview && "bg-orange-100",
									isPreview ? "bg-blue-200 opacity-50" : "hover:bg-gray-100",
								)}
								role="button"
								tabIndex={0}
								aria-label={`Select ${dateString}`}
								onMouseDown={() => handleMouseDown(index)}
								onMouseEnter={() => handleMouseMove(index)}
								onMouseUp={handleMouseUp}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										const period = {
											taskId: task.id,
											startDate: format(dates[index], "yyyy-MM-dd"),
											endDate: format(dates[index], "yyyy-MM-dd"),
										};
										onPeriodSelect(period);
									}
								}}
							/>
						);
					})}
				</div>

				{task.periods.map((period) => {
					const startOffset = differenceInDays(
						new Date(period.startDate),
						startDate,
					);
					const duration =
						differenceInDays(
							new Date(period.endDate),
							new Date(period.startDate),
						) + 1;
					const tag = getTagById(period.tagId);

					if (startOffset < 0 || startOffset >= dates.length) return null;

					return (
						<DateRange
							key={period.id}
							period={period}
							startOffset={startOffset}
							duration={duration}
							color={tag?.color || "#6B7280"}
						/>
					);
				})}
			</section>
		</div>
	);
}
