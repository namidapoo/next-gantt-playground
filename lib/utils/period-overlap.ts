import { isValid, parseISO } from "date-fns";
import type { Period } from "@/lib/types/gantt";

/**
 * 2つの日付範囲が重複しているかチェックする
 */
export function hasDateRangeOverlap(
	range1: { startDate: string; endDate: string },
	range2: { startDate: string; endDate: string },
): boolean {
	const start1 = parseISO(range1.startDate);
	const end1 = parseISO(range1.endDate);
	const start2 = parseISO(range2.startDate);
	const end2 = parseISO(range2.endDate);

	// 日付の有効性をチェック
	if (
		!isValid(start1) ||
		!isValid(end1) ||
		!isValid(start2) ||
		!isValid(end2)
	) {
		console.warn("Invalid date string provided to hasDateRangeOverlap");
		return false;
	}

	// 重複の条件: range1の開始日がrange2の終了日以前 かつ range1の終了日がrange2の開始日以降
	return start1 <= end2 && end1 >= start2;
}

/**
 * 指定された日付範囲が既存のPeriodと重複しているかチェックする
 */
export function hasOverlap(
	newPeriod: { startDate: string; endDate: string },
	existingPeriods: Period[],
	excludeId?: string,
): boolean {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	return targetPeriods.some((period) => hasDateRangeOverlap(newPeriod, period));
}

/**
 * 指定された日付が既存のPeriodと重複しているかチェックする
 */
export function isDateOccupied(
	date: string,
	existingPeriods: Period[],
	excludeId?: string,
): boolean {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	const targetDate = parseISO(date);

	// 日付の有効性をチェック
	if (!isValid(targetDate)) {
		console.warn("Invalid date string provided to isDateOccupied:", date);
		return false;
	}

	return targetPeriods.some((period) => {
		const startDate = parseISO(period.startDate);
		const endDate = parseISO(period.endDate);

		// 日付の有効性をチェック
		if (!isValid(startDate) || !isValid(endDate)) {
			console.warn("Invalid date string in period:", period);
			return false;
		}

		return targetDate >= startDate && targetDate <= endDate;
	});
}

/**
 * 既存のPeriodで占有されている日付のリストを取得する
 */
export function getOccupiedDates(
	existingPeriods: Period[],
	excludeId?: string,
): string[] {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	const occupiedDates = new Set<string>();

	targetPeriods.forEach((period) => {
		const startDate = parseISO(period.startDate);
		const endDate = parseISO(period.endDate);

		// 日付の有効性をチェック
		if (!isValid(startDate) || !isValid(endDate)) {
			console.warn("Invalid date string in period:", period);
			return;
		}

		// 期間内の全ての日付を追加
		const currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			occupiedDates.add(currentDate.toISOString().split("T")[0]);
			currentDate.setDate(currentDate.getDate() + 1);
		}
	});

	return Array.from(occupiedDates);
}
