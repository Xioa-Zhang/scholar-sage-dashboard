
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as DatePicker } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type DatePickerCardProps = {
  selectedDate: Date;
  onDateChange: (value: Date | Date[]) => void;
};

export const DatePickerCard = ({ selectedDate, onDateChange }: DatePickerCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="custom-calendar">
          <DatePicker
            onChange={onDateChange}
            value={selectedDate}
            className="w-full rounded-md border"
          />
        </div>
      </CardContent>
    </Card>
  );
};
