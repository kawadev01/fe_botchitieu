import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string) => void;
  defaultDate?: string;
  value?: string;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  defaultDate,
  value,
  label,
  placeholder,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const fpInstance = flatpickr(inputRef.current, {
      mode,
      static: true,
      dateFormat: "Y-m-d",
      defaultDate: defaultDate || value || undefined,
      onChange,
    });

    return () => {
      if (fpInstance) {
        fpInstance.destroy();
      }
    };
  }, [mode, onChange, defaultDate, value]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          value={value || ""}
          readOnly
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
