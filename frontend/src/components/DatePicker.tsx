// components/DatePicker.tsx
"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

interface CustomDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
}

export default function CustomDatePicker({
  label,
  value,
  onChange,
  error,
  maxDate = new Date(), // Mặc định không cho chọn ngày trong tương lai
  showYearDropdown = true,
  showMonthDropdown = true,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Tính toán khoảng năm hợp lý (từ 100 năm trước đến hiện tại)
  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear - 100, 0, 1);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600 font-medium">{label}</label>
      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          maxDate={maxDate}
          minDate={minDate}
          showYearDropdown={showYearDropdown}
          showMonthDropdown={showMonthDropdown}
          dropdownMode="select"
          yearDropdownItemNumber={50}
          scrollableYearDropdown
          placeholderText="Chọn ngày"
          className={`
            border px-3 py-2 rounded-lg w-full transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          `}
          wrapperClassName="w-full"
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
          // Tùy chỉnh style cho calendar
          calendarClassName="shadow-lg border-0 rounded-lg"
          dayClassName={(date) => {
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = value && date.toDateString() === value.toDateString();
            
            return `
              ${isToday ? 'bg-blue-100 text-blue-800 font-semibold' : ''}
              ${isSelected ? 'bg-blue-600 text-white' : ''}
              hover:bg-blue-100 transition-colors duration-150
            `;
          }}
        />
        {/* Icon lịch */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 transition-colors duration-200 ${
              isOpen ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-red-500 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}