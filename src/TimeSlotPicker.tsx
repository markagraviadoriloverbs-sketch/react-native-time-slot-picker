import React, { useEffect, useState, useCallback } from 'react';
import { IAppointment, IAvailableDates } from './interfaces/app.interface';
import { View } from 'react-native';
import ScheduleDatePicker from './components/ScheduleDatePicker';
import TimeSlots from './components/TimeSlots';
import { fixedAvailableDates } from './utils/dateHelpers';
import {
  defaultActiveColor,
  defaultDayNames,
  defaultMonthNames,
  defaultTimeSlotWidth,
} from './utils/data';
import { LocalContext } from './components/LocalContext';

interface Props {
  // Update the callback to handle start and end times
  setDateOfAppointment: (data: any | null) => void;
  availableDates?: IAvailableDates[];
  scheduledAppointment?: IAppointment | undefined;
  marginTop?: number;
  datePickerBackgroundColor?: string;
  timeSlotsBackgroundColor?: string;
  timeSlotsTitle?: string;
  mainColor?: string;
  timeSlotWidth?: number;
  dayNamesOverride?: string[];
  monthNamesOverride?: string[];
}

const TimeSlotPicker = ({
  availableDates = fixedAvailableDates,
  setDateOfAppointment,
  scheduledAppointment,
  marginTop = 0,
  datePickerBackgroundColor,
  timeSlotsBackgroundColor,
  timeSlotsTitle,
  mainColor = defaultActiveColor,
  timeSlotWidth = defaultTimeSlotWidth,
  dayNamesOverride = defaultDayNames,
  monthNamesOverride = defaultMonthNames,
}: Props) => {
  // 1. Change state to track range
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<IAvailableDates | undefined>(
    availableDates[0]
  );

  // Reset times when the date changes to prevent cross-day ranges
  const handleSetSelectedDate = (date: IAvailableDates) => {
    setSelectedDate(date);
    setStartTime(null);
    setEndTime(null);
  };

  useEffect(() => {
    const firstAvailableDay =
      availableDates.findIndex((date) => date.slotTimes.length > 0) || 0;
    setSelectedDate(availableDates?.[firstAvailableDay]);
    // We no longer auto-select the first slot to avoid confusing the range logic
    setStartTime(null);
    setEndTime(null);
  }, [availableDates]);

  // 2. Sync the range back to the parent form
  useEffect(() => {
    if (selectedDate && startTime) {
      setDateOfAppointment({
        appointmentDate: selectedDate.date,
        startTime: startTime,
        endTime: endTime, // This will be null until the user picks a second slot
      });
    } else {
      setDateOfAppointment(null);
    }
  }, [selectedDate, startTime, endTime, setDateOfAppointment]);

  // 3. Helper to reset the range (used when switching dates)
  const setRange = useCallback((start: string | null, end: string | null) => {
    setStartTime(start);
    setEndTime(end);
  }, []);

  return (
    <LocalContext
      slotDate={selectedDate?.date || ''}
      scheduledAppointment={scheduledAppointment}
      overrideData={{
        mainColor,
        timeSlotWidth,
        dayNamesOverride,
        monthNamesOverride,
      }}
    >
      <View style={{ marginTop }}>
        <View>
          <ScheduleDatePicker
            selectedDate={selectedDate}
            availableDates={availableDates}
            setSelectedDate={handleSetSelectedDate}
            // Passing a dummy function for backward compatibility if needed, 
            // or you can update ScheduleDatePicker to ignore this.
            setSelectedTime={() => { }}
            scheduledAppointment={scheduledAppointment}
            backgroundColor={datePickerBackgroundColor}
          />
        </View>
        {selectedDate && (
          <TimeSlots
            title={timeSlotsTitle}
            startTime={startTime}
            endTime={endTime}
            setRange={setRange}
            slotTimes={selectedDate.slotTimes}
            backgroundColor={timeSlotsBackgroundColor}
            mainColor={mainColor}
          />
        )}
      </View>
    </LocalContext>
  );
};

export default TimeSlotPicker;
