"use client";

import { differenceInDays, format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period, Task } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { DateRange } from "./DateRange";
import { PreviewPeriod } from "./PreviewPeriod";

interface TaskRowProps {
	task: Task;
	dates: Date[];
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	onPeriodEdit?: (period: Period, taskId: string) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	isAddModalOpen?: boolean;
}

export function TaskRow({
	task,
	dates,
	onPeriodSelect,
	onPeriodEdit,
	scrollRef,
	isAddModalOpen,
}: TaskRowProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<number | null>(null);
	const [dragEnd, setDragEnd] = useState<number | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
	const currentScrollDirection = useRef<"left" | "right" | null>(null);
	const { getTagById, selectedPeriod } = useGanttStore();

	// スクロール設定定数
	const SCROLL_ZONE_WIDTH = 80;
	const SCROLL_AMOUNT = 10;
	const SCROLL_INTERVAL = 50;

	// スクロール機能
	const startAutoScroll = useCallback(
		(direction: "left" | "right") => {
			if (!scrollRef?.current) return;

			// 既に同じ方向でスクロール中の場合は何もしない
			if (currentScrollDirection.current === direction) return;

			// 既存のタイマーをクリア
			if (scrollTimerRef.current) {
				clearInterval(scrollTimerRef.current);
				scrollTimerRef.current = null;
			}

			currentScrollDirection.current = direction;

			const scroll = () => {
				if (scrollRef.current) {
					const scrollAmount =
						direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
					scrollRef.current.scrollLeft += scrollAmount;
				}
			};

			scroll();
			scrollTimerRef.current = setInterval(scroll, SCROLL_INTERVAL);
		},
		[scrollRef],
	);

	const stopAutoScroll = useCallback(() => {
		if (scrollTimerRef.current) {
			clearInterval(scrollTimerRef.current);
			scrollTimerRef.current = null;
		}
		currentScrollDirection.current = null;
	}, []);

	// 共通のスクロール判定ロジック
	const checkScrollZone = useCallback(
		(mouseX: number, containerRect: DOMRect) => {
			const leftEdge = containerRect.left;
			const rightEdge = containerRect.right;

			// 左端スクロールゾーン
			if (mouseX <= leftEdge + SCROLL_ZONE_WIDTH) {
				startAutoScroll("left");
			}
			// 右端スクロールゾーン
			else if (mouseX >= rightEdge - SCROLL_ZONE_WIDTH) {
				startAutoScroll("right");
			}
			// 中央エリア
			else {
				stopAutoScroll();
			}
		},
		[startAutoScroll, stopAutoScroll],
	);

	const handleMouseDown = (index: number) => {
		setIsDragging(true);
		setDragStart(index);
		setDragEnd(index);
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
		stopAutoScroll();
	};

	// マウス位置ベースのスクロール判定
	const handleMouseMove = useCallback(
		(index: number, event: React.MouseEvent<HTMLDivElement>) => {
			if (isDragging && dragStart !== null) {
				setDragEnd(index);

				// スクロールコンテナのサイズと位置を取得
				if (!scrollRef?.current) return;

				const containerRect = scrollRef.current.getBoundingClientRect();
				const mouseX = event.clientX;

				// マウスがコンテナの範囲内にあることを確認
				if (mouseX >= containerRect.left && mouseX <= containerRect.right) {
					checkScrollZone(mouseX, containerRect);
				} else {
					// マウスがコンテナの外にある場合はスクロールを停止
					stopAutoScroll();
				}
			}
		},
		[isDragging, dragStart, scrollRef, checkScrollZone, stopAutoScroll],
	);

	// グローバルマウスイベントでドラッグ終了を管理
	useEffect(() => {
		if (!isDragging) return;

		const handleGlobalMouseUp = () => {
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
			stopAutoScroll();
		};

		const handleGlobalMouseMove = (event: MouseEvent) => {
			if (!scrollRef?.current) return;

			const containerRect = scrollRef.current.getBoundingClientRect();
			const mouseX = event.clientX;
			const mouseY = event.clientY;

			// マウスがコンテナの範囲内にあるかチェック
			const isInContainer =
				mouseX >= containerRect.left &&
				mouseX <= containerRect.right &&
				mouseY >= containerRect.top &&
				mouseY <= containerRect.bottom;

			if (!isInContainer) {
				stopAutoScroll();
				return;
			}

			// コンテナ内でのスクロール判定
			checkScrollZone(mouseX, containerRect);
		};

		document.addEventListener("mouseup", handleGlobalMouseUp);
		document.addEventListener("mousemove", handleGlobalMouseMove);

		return () => {
			document.removeEventListener("mouseup", handleGlobalMouseUp);
			document.removeEventListener("mousemove", handleGlobalMouseMove);
		};
	}, [
		isDragging,
		dragStart,
		dragEnd,
		task.id,
		dates,
		onPeriodSelect,
		stopAutoScroll,
		checkScrollZone,
		scrollRef,
	]);

	const isDateInPreview = () => {
		// セル全体のハイライトを廃止
		return false;
	};

	return (
		<section
			ref={gridRef}
			className="relative h-16 select-none min-w-max"
			onMouseUp={handleMouseUp}
			aria-label="Period selection grid"
		>
			<div className="absolute inset-0 flex">
				{dates.map((date, index) => {
					const dateString = format(date, "yyyy-MM-dd");
					const isToday = dateString === format(new Date(), "yyyy-MM-dd");
					const isWeekend = date.getDay() === 0 || date.getDay() === 6;
					const isPreview = isDateInPreview();

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
							onMouseEnter={(e) => handleMouseMove(index, e)}
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
				// 日付の文字列で正確にマッチするインデックスを見つける
				const periodStartDate = period.startDate;
				const startOffset = dates.findIndex(
					(date) => format(date, "yyyy-MM-dd") === periodStartDate,
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
						dates={dates}
						taskId={task.id}
						onEdit={onPeriodEdit}
					/>
				);
			})}

			{/* Preview Period for drag & drop */}
			{isDragging &&
				dragStart !== null &&
				dragEnd !== null &&
				(() => {
					const start = Math.min(dragStart, dragEnd);
					const end = Math.max(dragStart, dragEnd);
					const duration = end - start + 1;

					// デフォルトタグを使用
					const defaultTag = getTagById("development") || {
						id: "default",
						name: "デフォルト",
						color: "#6B7280",
					};

					return (
						<PreviewPeriod
							key={`drag-preview-${task.id}`}
							startOffset={start}
							duration={duration}
							tag={defaultTag}
						/>
					);
				})()}

			{/* Preview Period for new creation */}
			{selectedPeriod &&
				selectedPeriod.taskId === task.id &&
				isAddModalOpen &&
				!isDragging &&
				(() => {
					const previewStartDate = selectedPeriod.startDate;
					const previewEndDate = selectedPeriod.endDate;

					// 既存のPeriodと重複していないかチェック
					const isOverlapping = task.periods.some(
						(period) =>
							period.startDate === previewStartDate &&
							period.endDate === previewEndDate,
					);

					// 重複している場合は仮想Periodを表示しない
					if (isOverlapping) return null;

					const startOffset = dates.findIndex(
						(date) => format(date, "yyyy-MM-dd") === previewStartDate,
					);
					const duration =
						differenceInDays(
							new Date(previewEndDate),
							new Date(previewStartDate),
						) + 1;

					// デフォルトタグを使用（最初のタグを使用）
					const defaultTag = getTagById("development") || {
						id: "default",
						name: "デフォルト",
						color: "#6B7280",
					};

					if (startOffset < 0 || startOffset >= dates.length) return null;

					return (
						<PreviewPeriod
							key={`preview-${task.id}`}
							startOffset={startOffset}
							duration={duration}
							tag={defaultTag}
						/>
					);
				})()}
		</section>
	);
}
