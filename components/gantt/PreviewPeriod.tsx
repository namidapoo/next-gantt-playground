import type { Tag } from "@/lib/types/gantt";

interface PreviewPeriodProps {
	startOffset: number;
	duration: number;
	tag: Tag;
}

export function PreviewPeriod({
	startOffset,
	duration,
	tag,
}: PreviewPeriodProps) {
	return (
		<div
			className="absolute top-2 h-12 rounded shadow-sm flex items-center text-xs text-white font-medium overflow-hidden transition-all border-2 border-dashed"
			style={{
				left: `${startOffset * 40}px`,
				width: `${duration * 40}px`,
				backgroundColor: tag.color,
				opacity: 0.5,
				borderColor: tag.color,
			}}
			title="新規期間のプレビュー"
		>
			{/* テキストなし、色だけの表示 */}
		</div>
	);
}
