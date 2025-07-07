"use client";

import { addDays, subDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
	const { selectedPeriod, setSelectedPeriod } = useGanttStore();
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

	const handlePeriodEdit = (period: Period) => {
		setEditingPeriod(period);
		setIsEditModalOpen(true);
	};

	const handleEditModalClose = () => {
		setIsEditModalOpen(false);
		setEditingPeriod(null);
		setSelectedPeriod(null);
	};

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

	return (
		<DndProvider backend={HTML5Backend}>
			<div
				ref={ganttContainerRef}
				className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
			>
				<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200">
					<div className="bg-gray-50 p-3 font-semibold flex items-center">
						Tasks
					</div>
					<Timeline
						dates={dates}
						scrollRef={timelineScrollRef}
						onScroll={handleScroll("timeline")}
					/>
				</div>

				<div className="border-t border-gray-200">
					<TaskList
						dates={dates}
						onPeriodSelect={handlePeriodSelect}
						onPeriodEdit={handlePeriodEdit}
						scrollRef={contentScrollRef}
						onScroll={handleScroll("content")}
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
