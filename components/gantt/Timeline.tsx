import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimelineProps {
	dates: Date[];
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function Timeline({ dates, scrollRef, onScroll }: TimelineProps) {
	const months = new Map<string, Date[]>();

	dates.forEach((date) => {
		const monthKey = format(date, "yyyy-MM");
		if (!months.has(monthKey)) {
			months.set(monthKey, []);
		}
		months.get(monthKey)?.push(date);
	});

	return (
		<div ref={scrollRef} className="overflow-x-auto" onScroll={onScroll}>
			<div className="min-w-max">
				<div className="flex border-b border-gray-200">
					{Array.from(months.entries()).map(([monthKey, monthDates]) => (
						<div
							key={monthKey}
							className="flex-shrink-0 text-center font-semibold py-2 border-r border-gray-200"
							style={{ width: `${monthDates.length * 40}px` }}
						>
							{format(monthDates[0], "yyyy.M")}
						</div>
					))}
				</div>

				<div className="flex">
					{dates.map((date, index) => {
						const dateString = format(date, "yyyy-MM-dd");
						const isToday = dateString === format(new Date(), "yyyy-MM-dd");
						const isWeekend = date.getDay() === 0 || date.getDay() === 6;

						return (
							<div
								key={dateString}
								className={cn(
									"flex-shrink-0 w-10 text-center py-2 text-xs border-r border-gray-200",
									index === 0 && "border-l",
									isToday && "bg-orange-100 font-bold",
									isWeekend && "bg-gray-50",
								)}
							>
								<div>{format(date, "d")}</div>
								<div className="text-gray-500">{format(date, "EEE")}</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
