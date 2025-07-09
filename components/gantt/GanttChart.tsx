"use client";

import { addDays, subDays } from "date-fns";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { AddPeriodModal } from "./AddPeriodModal";
import { EditPeriodModal } from "./EditPeriodModal";
import { TaskList } from "./TaskList";
import { Timeline } from "./Timeline";

const DAYS_BEFORE_TODAY = 7;
const TOTAL_DAYS = 60; // 2ヶ月分

export function GanttChart() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
	const { selectedPeriod, setSelectedPeriod, addTask, setEditingTaskId } =
		useGanttStore();
	const timelineScrollRef = useRef<HTMLDivElement>(null);
	const contentScrollRef = useRef<HTMLDivElement>(null);
	const ganttContainerRef = useRef<HTMLDivElement>(null);

	const startDate = subDays(new Date(), DAYS_BEFORE_TODAY);

	const dates: Date[] = [];
	for (let i = 0; i < TOTAL_DAYS; i++) {
		dates.push(addDays(startDate, i));
	}

	const handlePeriodSelect = (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => {
		if (period) {
			setSelectedPeriod(period);
			setIsModalOpen(true);
		}
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedPeriod(null);
	};

	const handlePeriodEdit = (period: Period, taskId: string) => {
		setEditingPeriod(period);
		setSelectedPeriod({
			taskId,
			startDate: period.startDate,
			endDate: period.endDate,
			periodId: period.id,
		});
		setIsEditModalOpen(true);
	};

	const handleEditModalClose = () => {
		setIsEditModalOpen(false);
		setEditingPeriod(null);
		setSelectedPeriod(null);
	};

	const handleAddTask = useCallback(() => {
		const taskId = addTask("");
		setEditingTaskId(taskId);
	}, [addTask, setEditingTaskId]);

	const handleScroll =
		(source: "timeline" | "content") => (e: React.UIEvent<HTMLDivElement>) => {
			const scrollLeft = e.currentTarget.scrollLeft;

			if (source === "timeline" && contentScrollRef.current) {
				contentScrollRef.current.scrollLeft = scrollLeft;
			} else if (source === "content" && timelineScrollRef.current) {
				timelineScrollRef.current.scrollLeft = scrollLeft;
			}
		};

	useEffect(() => {
		const container = ganttContainerRef.current;
		if (!container) return;

		const handleWheel = (e: WheelEvent) => {
			if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
				e.preventDefault();
				const scrollAmount = e.deltaX || e.deltaY;

				if (timelineScrollRef.current) {
					timelineScrollRef.current.scrollLeft += scrollAmount;
				}
			}
		};

		container.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			container.removeEventListener("wheel", handleWheel);
		};
	}, []);

	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "n") {
				e.preventDefault();
				handleAddTask();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleAddTask]);

	return (
		<DndProvider backend={HTML5Backend}>
			<div
				ref={ganttContainerRef}
				className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full"
			>
				{/* 固定ヘッダー */}
				<div className="flex border-b border-gray-200 flex-shrink-0">
					<div className="w-[250px] bg-gray-50 p-3 font-semibold flex items-center justify-between border-r border-gray-200 flex-shrink-0">
						<span>Tasks</span>
						<Button
							onClick={handleAddTask}
							variant="outline"
							size="sm"
							className="h-7 w-7 p-0"
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>
					<div className="flex-1 overflow-x-auto border-b border-gray-200">
						<Timeline
							dates={dates}
							scrollRef={timelineScrollRef}
							onScroll={handleScroll("timeline")}
						/>
					</div>
				</div>

				{/* スクロール可能なコンテンツエリア */}
				<div className="flex-1 overflow-y-auto">
					<TaskList
						dates={dates}
						onPeriodSelect={handlePeriodSelect}
						onPeriodEdit={handlePeriodEdit}
						scrollRef={contentScrollRef}
						onScroll={handleScroll("content")}
						isAddModalOpen={isModalOpen}
					/>
				</div>
			</div>

			<AddPeriodModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				taskId={selectedPeriod?.taskId || ""}
				startDate={selectedPeriod?.startDate || ""}
				endDate={selectedPeriod?.endDate || ""}
			/>

			<EditPeriodModal
				isOpen={isEditModalOpen}
				onClose={handleEditModalClose}
				period={editingPeriod}
			/>
		</DndProvider>
	);
}
