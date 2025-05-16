import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar as DatePicker } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useSubjects } from "@/lib/database";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { Value } from 'react-calendar';

// Fixed type for onChange
const handleCalendarChange = (value: Value) => {
  if (value instanceof Date) {
    setSelectedDate(value);
  } else if (Array.isArray(value) && value[0] instanceof Date) {
    setSelectedDate(value[0]);
  }
};

// Inside the component, update DatePicker like this:
<DatePicker
  onChange={handleCalendarChange}
  value={selectedDate}
  className="w-full rounded-md border"
/>

// OR update the function inline with the same check if not abstracted
