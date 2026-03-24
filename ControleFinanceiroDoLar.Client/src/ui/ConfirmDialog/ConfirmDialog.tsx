import { ReactNode } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface ConfirmDialogProps {
    trigger: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export function ConfirmDialog({
    trigger,
    title = "Você tem certeza?",
    description = "Essa ação não poderá ser desfeita.",
    cancelText = "Cancelar",
    confirmText = "Sim, deletar",
    onConfirm,
    disabled = false,
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                {trigger}
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
                <AlertDialog.Overlay className="AlertDialogOverlay" />

                <AlertDialog.Content className="AlertDialogContent">
                    <AlertDialog.Title className="AlertDialogTitle">
                        {title}
                    </AlertDialog.Title>

                    <AlertDialog.Description className="AlertDialogDescription">
                        {description}
                    </AlertDialog.Description>

                    <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
                        <AlertDialog.Cancel asChild>
                            <button className="Button mauve" disabled={disabled || isLoading}>
                                {cancelText}
                            </button>
                        </AlertDialog.Cancel>

                        <AlertDialog.Action asChild>
                            <button
                                className="Button red"
                                onClick={onConfirm}
                                disabled={disabled || isLoading}
                            >
                                {isLoading ? "Excluindo..." : confirmText}
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}