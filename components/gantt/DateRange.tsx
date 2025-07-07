import type { Period } from "@/lib/types/gantt";

interface DateRangeProps {
	period: Period;
	startOffset: number;
	duration: number;
	color: string;
	onEdit?: (period: Period) => void;
}

export function DateRange({
	period,
	startOffset,
	duration,
	color,
	onEdit,
}: DateRangeProps) {
	return (
		<button
			type="button"
			className="absolute top-2 h-12 rounded shadow-sm flex items-center px-2 text-xs text-white font-medium overflow-hidden cursor-pointer hover:brightness-110 transition-all border-none"
			style={{
				left: `${startOffset * 40}px`,
				width: `${duration * 40}px`,
				backgroundColor: color,
			}}
			title={period.note}
			onClick={(e) => {
				e.stopPropagation();
				onEdit?.(period);
			}}
		>
			<span className="truncate">{period.note}</span>
		</button>
	);
}
