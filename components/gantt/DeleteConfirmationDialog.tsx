"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
}

export function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = "Delete",
	cancelText = "Cancel",
}: DeleteConfirmationDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						{title}
					</DialogTitle>
					<DialogDescription className="text-left">
						{description}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} type="button">
						{cancelText}
					</Button>
					<Button 
						variant="destructive" 
						onClick={handleConfirm}
						type="button"
						className="cursor-pointer"
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}