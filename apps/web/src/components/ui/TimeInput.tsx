"use client";
import React from "react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, className }) => {
  const parseDateTime = (dateTimeValue: string) => {
    if (!dateTimeValue) return { date: "", hour: "", minute: "" };
    
    const [date, time] = dateTimeValue.split("T");
    const [hour, minute] = time ? time.split(":") : ["", ""];
    
    return { date, hour, minute };
  };

  const { date, hour, minute } = parseDateTime(value);

  const handleDateChange = (newDate: string) => {
    const currentHour = hour || "09";
    const currentMinute = minute || "00";
    if (newDate) {
      onChange(`${newDate}T${currentHour}:${currentMinute}`);
    }
  };

  const handleTimeChange = (newHour: string, newMinute: string) => {
    const currentDate = date || new Date().toISOString().split('T')[0];
    if (newHour && newMinute) {
      onChange(`${currentDate}T${newHour}:${newMinute}`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        type="date"
        value={date}
        onChange={(e) => handleDateChange(e.target.value)}
        className="flex-1"
      />
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

export default TimeInput;