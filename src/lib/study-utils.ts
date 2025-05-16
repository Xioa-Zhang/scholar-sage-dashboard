
// Date handling utils
export const handleDateChange = (value: Date | Date[], setDate: (date: Date) => void) => {
  // Ensure we're working with a single date
  if (Array.isArray(value)) {
    setDate(value[0]);
  } else {
    setDate(value);
  }
};

// Format duration (minutes to hours and minutes)
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time (seconds to mm:ss)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
