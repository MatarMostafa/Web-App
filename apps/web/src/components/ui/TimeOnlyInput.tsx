"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

interface TimeOnlyInputProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  className?: string;
}

const TimeOnlyInput: React.FC<TimeOnlyInputProps> = ({ value, onChange, className }) => {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const handleTimeChange = (newHour: string, newMinute: string) => {
    if (newHour && newMinute) {
      onChange(`${newHour}:${newMinute}`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={hour} onValueChange={(h) => handleTimeChange(h, minute || "00")}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={minute} onValueChange={(m) => handleTimeChange(hour || "09", m)}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeOnlyInput;