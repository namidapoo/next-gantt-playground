"use client";

import { differenceInDays, format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period, Task } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { hasOverlap, isDateOccupied } from "@/lib/utils/period-overlap";
import { DateRange } from "./DateRange";

interface TaskRowProps {
	task: Task;
	dates: Date[];
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	onPeriodEdit?: (period: Period, taskId: string) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	isAddModalOpen?: boolean;
	isLastRow?: boolean;
}

export function TaskRow({
	task,
	dates,
	onPeriodSelect,
	onPeriodEdit,
	scrollRef,
	isAddModalOpen,
	isLastRow = false,
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

				// 重複チェック
				if (hasOverlap(period, task.periods)) {
					toast.error("選択した期間に既存のPeriodがあります", {
						description: "別の期間を選択してください",
						id: "period-overlap-error",
					});
				} else {
					onPeriodSelect(period);
				}
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
		task.periods,
		dates,
		onPeriodSelect,
		stopAutoScroll,
		checkScrollZone,
		scrollRef,
	]);

	const getDatePreviewState = (index: number) => {
		// ドラッグ中のプレビュー（新規作成時のみ）
		if (isDragging && dragStart !== null && dragEnd !== null) {
			const start = Math.min(dragStart, dragEnd);
			const end = Math.max(dragStart, dragEnd);

			if (index >= start && index <= end) {
				// 重複チェック
				const dateStr = format(dates[index], "yyyy-MM-dd");
				const isOccupied = isDateOccupied(dateStr, task.periods);

				return {
					isPreview: true,
					isOverlapped: isOccupied,
				};
			}
		}

		// モーダルで選択された期間のハイライト（新規作成時のみ）
		if (selectedPeriod && selectedPeriod.taskId === task.id && isAddModalOpen) {
			const selectedStartDate = new Date(selectedPeriod.startDate);
			const selectedEndDate = new Date(selectedPeriod.endDate);
			const currentDate = dates[index];

			if (currentDate) {
				// 日付のみで比較するため、時間部分を0にする
				const currentDateOnly = new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					currentDate.getDate(),
				);
				const startDateOnly = new Date(
					selectedStartDate.getFullYear(),
					selectedStartDate.getMonth(),
					selectedStartDate.getDate(),
				);
				const endDateOnly = new Date(
					selectedEndDate.getFullYear(),
					selectedEndDate.getMonth(),
					selectedEndDate.getDate(),
				);

				if (
					currentDateOnly >= startDateOnly &&
					currentDateOnly <= endDateOnly
				) {
					return {
						isPreview: true,
						isOverlapped: false,
					};
				}
			}
		}

		return {
			isPreview: false,
			isOverlapped: false,
		};
	};

	return (
		<section
			ref={gridRef}
			className="relative h-16 select-none min-w-max"
			aria-label="Period selection grid"
		>
			<div className="absolute inset-0 flex">
				{dates.map((date, index) => {
					const dateString = format(date, "yyyy-MM-dd");
					const isToday = dateString === format(new Date(), "yyyy-MM-dd");
					const isWeekend = date.getDay() === 0 || date.getDay() === 6;
					const previewState = getDatePreviewState(index);

					return (
						<div
							key={`${task.id}-${dateString}`}
							className={cn(
								"flex-shrink-0 w-10 h-full border-r cursor-pointer",
								!isLastRow && "border-b border-gray-200",
								isWeekend && !previewState.isPreview && "bg-gray-50",
								isToday && !previewState.isPreview && "bg-orange-100",
								previewState.isPreview &&
									previewState.isOverlapped &&
									"bg-red-300 opacity-70",
								previewState.isPreview &&
									!previewState.isOverlapped &&
									"bg-blue-200 opacity-50",
								!previewState.isPreview && "hover:bg-gray-100",
							)}
							role="button"
							tabIndex={0}
							aria-label={`Select ${dateString}`}
							onMouseDown={() => handleMouseDown(index)}
							onMouseEnter={(e) => handleMouseMove(index, e)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									const dateStr = format(dates[index], "yyyy-MM-dd");

									// 重複チェック
									if (isDateOccupied(dateStr, task.periods)) {
										toast.error("この日付には既にPeriodが存在します", {
											description: "別の日付を選択してください",
											id: "date-occupied-error",
										});
									} else {
										const period = {
											taskId: task.id,
											startDate: dateStr,
											endDate: dateStr,
										};
										onPeriodSelect(period);
									}
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
						existingPeriods={task.periods}
						onEdit={onPeriodEdit}
					/>
				);
			})}
		</section>
	);
}
