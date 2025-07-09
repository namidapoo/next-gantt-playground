import { format } from "date-fns";
import { useState, useCallback, useEffect } from "react";
import type { Period } from "@/lib/types/gantt";

interface DateRangeProps {
	period: Period;
	startOffset: number;
	duration: number;
	color: string;
	dates: Date[];
	taskId: string;
	onEdit?: (period: Period) => void;
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
	const [isDragging, setIsDragging] = useState(false);
	const [dragType, setDragType] = useState<'start' | 'end' | null>(null);
	const [dragStartX, setDragStartX] = useState(0);
	const [tempOffset, setTempOffset] = useState(startOffset);
	const [tempDuration, setTempDuration] = useState(duration);

	const handleMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end') => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
		setDragType(type);
		setDragStartX(e.clientX);
		setTempOffset(startOffset);
		setTempDuration(duration);
	}, [startOffset, duration]);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDragging || !dragType) return;

		const deltaX = e.clientX - dragStartX;
		const dayDelta = Math.round(deltaX / 40); // 40px per day

		if (dragType === 'start') {
			// 開始日を変更（範囲チェック）
			const newStartOffset = Math.max(0, Math.min(startOffset + dayDelta, startOffset + duration - 1, dates.length - 1));
			const newDuration = duration - (newStartOffset - startOffset);
			setTempOffset(newStartOffset);
			setTempDuration(newDuration);
		} else if (dragType === 'end') {
			// 終了日を変更（範囲チェック）
			const maxDuration = dates.length - startOffset;
			const newDuration = Math.max(1, Math.min(duration + dayDelta, maxDuration));
			setTempDuration(newDuration);
		}
	}, [isDragging, dragType, dragStartX, startOffset, duration]);

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
				startDate: format(newStartDate, 'yyyy-MM-dd'),
				endDate: format(newEndDate, 'yyyy-MM-dd'),
			};

			// 編集のコールバックを呼び出してEditPeriodModalを開く
			onEdit?.(updatedPeriod);
		}

		// 表示を元に戻す
		setTempOffset(startOffset);
		setTempDuration(duration);
	}, [isDragging, dragType, tempOffset, tempDuration, dates, period, onEdit, startOffset, duration]);

	// グローバルマウスイベントリスナー
	const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
		handleMouseMove(e);
	}, [handleMouseMove]);

	const handleGlobalMouseUp = useCallback(() => {
		handleMouseUp();
	}, [handleMouseUp]);

	// ドラッグ中にグローバルリスナーを追加
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleGlobalMouseMove);
			document.addEventListener('mouseup', handleGlobalMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	}, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

	const currentStartOffset = isDragging ? tempOffset : startOffset;
	const currentDuration = isDragging ? tempDuration : duration;

	return (
		<div
			className="absolute top-2 h-12 rounded shadow-sm flex items-center text-xs text-white font-medium overflow-hidden transition-all border-none"
			style={{
				left: `${currentStartOffset * 40}px`,
				width: `${currentDuration * 40}px`,
				backgroundColor: color,
				opacity: isDragging ? 0.7 : 1,
			}}
			title={period.note}
		>
			{/* 左端のドラッグハンドル */}
			<div
				className="absolute left-0 top-0 w-2 h-full cursor-col-resize hover:bg-black hover:bg-opacity-20 transition-colors"
				onMouseDown={(e) => handleMouseDown(e, 'start')}
				title="開始日を変更"
			/>
			
			{/* 中央のクリック可能エリア */}
			<button
				type="button"
				className="flex-1 h-full px-2 cursor-pointer hover:brightness-110 transition-all border-none bg-transparent"
				onClick={(e) => {
					e.stopPropagation();
					onEdit?.(period);
				}}
			>
				<span className="truncate">{period.note}</span>
			</button>
			
			{/* 右端のドラッグハンドル */}
			<div
				className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-black hover:bg-opacity-20 transition-colors"
				onMouseDown={(e) => handleMouseDown(e, 'end')}
				title="終了日を変更"
			/>
		</div>
	);
}
