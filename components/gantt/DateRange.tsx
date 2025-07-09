import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";

// 定数
const DAY_WIDTH = 40; // pixels per day
const DRAG_HANDLE_WIDTH = 12; // ドラッグハンドルの幅（px）

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
	const [cursorStyle, setCursorStyle] = useState<"pointer" | "col-resize">(
		"pointer",
	);

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

	const handlePeriodMouseDown = useCallback(
		(e: React.MouseEvent) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const relativeX = e.clientX - rect.left;

			// 左端の範囲なら左端ドラッグ
			if (relativeX <= DRAG_HANDLE_WIDTH) {
				handleMouseDown(e, "start");
			}
			// 右端の範囲なら右端ドラッグ
			else if (relativeX >= rect.width - DRAG_HANDLE_WIDTH) {
				handleMouseDown(e, "end");
			}
			// 中央の範囲なら編集モーダル
			else {
				e.stopPropagation();
				onEdit?.(period, taskId);
			}
		},
		[handleMouseDown, onEdit, period, taskId],
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
		selectedPeriod.periodId === period.id &&
		(selectedPeriod.startDate !== period.startDate ||
			selectedPeriod.endDate !== period.endDate);

	// 表示用のオフセットと期間を計算
	const currentStartOffset =
		isDragging || isSelectedAndModified ? tempOffset : startOffset;
	const currentDuration =
		isDragging || isSelectedAndModified ? tempDuration : duration;

	// マウスホバー時のカーソル判定（throttled）
	const handleMouseMove_Hover = useCallback(
		(e: React.MouseEvent) => {
			if (isDragging) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const relativeX = e.clientX - rect.left;

			// カーソルスタイルを判定
			let newCursorStyle: "pointer" | "col-resize" = "pointer";
			if (
				relativeX <= DRAG_HANDLE_WIDTH ||
				relativeX >= rect.width - DRAG_HANDLE_WIDTH
			) {
				newCursorStyle = "col-resize";
			}

			// 状態が変更された場合のみ更新
			if (newCursorStyle !== cursorStyle) {
				setCursorStyle(newCursorStyle);
			}
		},
		[isDragging, cursorStyle],
	);

	// マウスがPeriodを離れた時のカーソルリセット
	const handleMouseLeave = useCallback(() => {
		if (!isDragging) {
			setCursorStyle("pointer");
		}
	}, [isDragging]);

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
		<button
			type="button"
			className="absolute top-2 h-12 rounded shadow-sm flex items-center text-xs text-white font-medium overflow-hidden transition-all border-none"
			style={{
				left: `${currentStartOffset * DAY_WIDTH}px`,
				width: `${currentDuration * DAY_WIDTH}px`,
				backgroundColor: color,
				opacity: isDragging ? 0.7 : 1,
				cursor: cursorStyle,
			}}
			title={period.note}
			onMouseDown={handlePeriodMouseDown}
			onMouseMove={handleMouseMove_Hover}
			onMouseLeave={handleMouseLeave}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onEdit?.(period, taskId);
				}
			}}
			aria-label={`期間: ${period.note}. 左端をドラッグして開始日を変更、右端をドラッグして終了日を変更、中央をクリックして編集`}
		>
			{/* 左端のドラッグエリア */}
			<div
				className="absolute left-0 top-0 w-3 h-full transition-colors hover:bg-black hover:bg-opacity-30"
				// インラインスタイルを使用：条件付きCSSクラス（cn）では正しく動作しないため
				// pointer-events制御とホバー効果の組み合わせはインラインスタイルが確実
				style={{
					backgroundColor: isDragging ? "transparent" : undefined,
					pointerEvents: isDragging ? "none" : "auto",
				}}
			/>

			{/* 中央のコンテンツエリア */}
			<div className="flex-1 px-3 pointer-events-none">
				<span className="truncate">{period.note}</span>
			</div>

			{/* 右端のドラッグエリア */}
			<div
				className="absolute right-0 top-0 w-3 h-full transition-colors hover:bg-black hover:bg-opacity-30"
				// インラインスタイルを使用：条件付きCSSクラス（cn）では正しく動作しないため
				// pointer-events制御とホバー効果の組み合わせはインラインスタイルが確実
				style={{
					backgroundColor: isDragging ? "transparent" : undefined,
					pointerEvents: isDragging ? "none" : "auto",
				}}
			/>
		</button>
	);
}
