import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";

// 定数
const DAY_WIDTH = 40; // pixels per day

// ユーティリティ関数
const findDateIndex = (dates: Date[], targetDate: Date): number => {
	return dates.findIndex((date) => {
		const dateOnly = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
		);
		const targetOnly = new Date(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate(),
		);
		return dateOnly.getTime() === targetOnly.getTime();
	});
};

interface DateRangeProps {
	period: Period;
	startOffset: number;
	duration: number;
	color: string;
	dates: Date[];
	taskId: string;
	onEdit?: (period: Period, taskId: string) => void;
}

export function DateRange({
	period,
	startOffset,
	duration,
	color,
	dates,
	taskId,
	onEdit,
}: DateRangeProps) {
	const { selectedPeriod } = useGanttStore();
	const [isDragging, setIsDragging] = useState(false);
	const [dragType, setDragType] = useState<"start" | "end" | null>(null);
	const [dragStartX, setDragStartX] = useState(0);
	const [tempOffset, setTempOffset] = useState(startOffset);
	const [tempDuration, setTempDuration] = useState(duration);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent, type: "start" | "end") => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(true);
			setDragType(type);
			setDragStartX(e.clientX);
			setTempOffset(startOffset);
			setTempDuration(duration);
		},
		[startOffset, duration],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !dragType) return;

			const deltaX = e.clientX - dragStartX;
			const dayDelta = Math.round(deltaX / DAY_WIDTH);

			if (dragType === "start") {
				// 開始日を変更（範囲チェック）
				const maxStartOffset = startOffset + duration - 1;
				const newStartOffset = Math.max(
					0,
					Math.min(startOffset + dayDelta, maxStartOffset, dates.length - 1),
				);
				const newDuration = duration - (newStartOffset - startOffset);
				setTempOffset(newStartOffset);
				setTempDuration(newDuration);
			} else if (dragType === "end") {
				// 終了日を変更（範囲チェック）
				const maxDuration = dates.length - startOffset;
				const newDuration = Math.max(
					1,
					Math.min(duration + dayDelta, maxDuration),
				);
				setTempDuration(newDuration);
			}
		},
		[isDragging, dragType, dragStartX, startOffset, duration, dates.length],
	);

	const handleMouseUp = useCallback(() => {
		if (!isDragging || !dragType) return;

		setIsDragging(false);
		setDragType(null);

		// 新しい日付を計算
		const newStartDate = dates[tempOffset];
		const newEndDate = dates[tempOffset + tempDuration - 1];

		if (newStartDate && newEndDate) {
			// 既存期間データに更新された日付を含めて編集モーダルを開く
			const updatedPeriod = {
				...period,
				startDate: format(newStartDate, "yyyy-MM-dd"),
				endDate: format(newEndDate, "yyyy-MM-dd"),
			};

			// 編集のコールバックを呼び出してEditPeriodModalを開く
			onEdit?.(updatedPeriod, taskId);
		}

		// モーダルが開いている間は表示を維持するため、ここでは元に戻さない
	}, [
		isDragging,
		dragType,
		tempOffset,
		tempDuration,
		dates,
		period,
		onEdit,
		taskId,
	]);

	// グローバルマウスイベントリスナー
	const handleGlobalMouseMove = useCallback(
		(e: MouseEvent) => {
			handleMouseMove(e);
		},
		[handleMouseMove],
	);

	const handleGlobalMouseUp = useCallback(() => {
		handleMouseUp();
	}, [handleMouseUp]);

	// ドラッグ中にグローバルリスナーを追加
	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleGlobalMouseMove);
			document.addEventListener("mouseup", handleGlobalMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

	// この期間が選択されていて、かつ日付が変更されているかチェック
	const isSelectedAndModified =
		selectedPeriod &&
		selectedPeriod.taskId === taskId &&
		(selectedPeriod.startDate !== period.startDate ||
			selectedPeriod.endDate !== period.endDate);

	// 表示用のオフセットと期間を計算
	const currentStartOffset =
		isDragging || isSelectedAndModified ? tempOffset : startOffset;
	const currentDuration =
		isDragging || isSelectedAndModified ? tempDuration : duration;

	// selectedPeriodが変更されたときにtempOffsetとtempDurationを更新
	useEffect(() => {
		if (isSelectedAndModified && dates.length > 0) {
			const newStartDate = new Date(selectedPeriod.startDate);
			const newEndDate = new Date(selectedPeriod.endDate);

			// 新しい開始位置を計算
			const newStartIndex = findDateIndex(dates, newStartDate);

			// 新しい期間を計算
			const newEndIndex = findDateIndex(dates, newEndDate);

			if (newStartIndex !== -1 && newEndIndex !== -1) {
				setTempOffset(newStartIndex);
				setTempDuration(newEndIndex - newStartIndex + 1);
			}
		} else if (!selectedPeriod) {
			// selectedPeriodがnullになったら元に戻す
			setTempOffset(startOffset);
			setTempDuration(duration);
		}
	}, [selectedPeriod, dates, startOffset, duration, isSelectedAndModified]);

	return (
		<div
			className="absolute top-2 h-12 rounded shadow-sm flex items-center text-xs text-white font-medium overflow-hidden transition-all border-none"
			style={{
				left: `${currentStartOffset * DAY_WIDTH}px`,
				width: `${currentDuration * DAY_WIDTH}px`,
				backgroundColor: color,
				opacity: isDragging ? 0.7 : 1,
			}}
			title={period.note}
		>
			{/* 左端のドラッグハンドル */}
			<div
				role="button"
				tabIndex={0}
				className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-black hover:bg-opacity-20 transition-colors"
				onMouseDown={(e) => handleMouseDown(e, "start")}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
					}
				}}
				title="開始日を変更"
				aria-label="開始日を変更するハンドル"
			/>

			{/* 中央のクリック可能エリア */}
			<button
				type="button"
				className="flex-1 h-full px-2 cursor-pointer hover:brightness-110 transition-all border-none bg-transparent"
				onClick={(e) => {
					e.stopPropagation();
					onEdit?.(period, taskId);
				}}
			>
				<span className="truncate">{period.note}</span>
			</button>

			{/* 右端のドラッグハンドル */}
			<div
				role="button"
				tabIndex={0}
				className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-black hover:bg-opacity-20 transition-colors"
				onMouseDown={(e) => handleMouseDown(e, "end")}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
					}
				}}
				title="終了日を変更"
				aria-label="終了日を変更するハンドル"
			/>
		</div>
	);
}
