import type { Period } from "@/lib/types/gantt";

interface DateRangeProps {
	period: Period;
	startOffset: number;
	duration: number;
	color: string;
}

export function DateRange({
	period,
	startOffset,
	duration,
	color,
}: DateRangeProps) {
	return (
		<div
			className="absolute top-2 h-12 rounded shadow-sm flex items-center px-2 text-xs text-white font-medium overflow-hidden"
			style={{
				left: `${startOffset * 40}px`,
				width: `${duration * 40}px`,
				backgroundColor: color,
			}}
			title={period.note}
		>
			<span className="truncate">{period.note}</span>
		</div>
	);
}
