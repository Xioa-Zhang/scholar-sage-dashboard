
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

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
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) onDateChange(date);
            }}
            className="rounded-md pointer-events-auto w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
