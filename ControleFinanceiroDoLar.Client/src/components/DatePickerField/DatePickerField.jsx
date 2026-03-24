import React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export function DatePickerField({ value, onChange, disabled }) {
    return (
        <DayPicker
            locale={ptBR}
            mode="single"
            selected={value}
            onSelect={(d) => {
                if (d) onChange(d); // devolve Date
            }}
            disabled={disabled}
            weekStartsOn={0} // opcional: 1 = segunda-feira
        />
    );
}