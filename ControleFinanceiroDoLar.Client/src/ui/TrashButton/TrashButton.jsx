import React from "react";
import PropTypes from "prop-types";
import { TrashIcon } from "@radix-ui/react-icons";
import { Trash2 } from "lucide-react";
import "./TrashButton.css";

export function TrashButton({
    onClick = () => { },
    disabled = false,
    isLucideIcon = false,
    title = "Excluir"
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label="Excluir, botão"
            title={title}
            className="iconButton danger"
        >
            {isLucideIcon ? <Trash2 size={18} /> : <TrashIcon width={18} height={18} />}
        </button>
    );
}

TrashButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    isLucideIcon: PropTypes.bool,
};