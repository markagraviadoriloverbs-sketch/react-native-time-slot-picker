import React, { useCallback, useContext, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../utils/theme';
import {
  OverrideDataContext,
  ScheduledAppointmentContext,
  SelectedDateContext,
} from './LocalContext';

interface Props {
  value: string;
  onPress: () => void;
  startTime: string | null;
  endTime: string | null;
}

const TimeSlot = ({ value, onPress, startTime, endTime }: Props) => {
  const scheduledAppointment = useContext(ScheduledAppointmentContext);
  const selectedDate = useContext(SelectedDateContext);
  const { mainColor, timeSlotWidth } = useContext(OverrideDataContext);

  const convertToMinutes = (timeString: string | null | undefined): number => {
    if (!timeString) return -1;
    const [time = "", modifier = ""] = timeString.split(' ');
    const [hoursStr = "0", minutesStr = "0"] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes) || !modifier) return -1;
    const upperModifier = modifier.toUpperCase();
    if (hours === 12) {
      hours = upperModifier === 'AM' ? 0 : 12;
    } else if (upperModifier === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  };

  // 1. Identify specific positions in the range
  const isStart = value === startTime;
  const isEnd = value === endTime;
  const isSelected = isStart || isEnd;

  const isBetween = useMemo(() => {
    if (!startTime || !endTime) return false;
    const currentVal = convertToMinutes(value);
    const startVal = convertToMinutes(startTime);
    const endVal = convertToMinutes(endTime);
    if (currentVal === -1 || startVal === -1 || endVal === -1) return false;

    // Use min/max to support selecting end before start visually
    const min = Math.min(startVal, endVal);
    const max = Math.max(startVal, endVal);
    return currentVal > min && currentVal < max;
  }, [value, startTime, endTime]);

  // 2. Define the colors
  // You can replace '#FFD700' with whatever secondary color fits your Retro aesthetic
  const startColor = mainColor;
  const endColor = '#FF5722'; // Example: A Deep Orange/Red for the End slot

  const containerStyle = useMemo(() => {
    if (isStart) return { backgroundColor: startColor };
    if (isEnd) return { backgroundColor: endColor };
    if (isBetween) return { backgroundColor: startColor + '40' }; // Semi-transparent bridge
    return styles.unSelected;
  }, [isStart, isEnd, isBetween, startColor, endColor]);

  const appointmentDateToCompare = useMemo(
    () => scheduledAppointment?.appointmentDate?.split('T')[0],
    [scheduledAppointment?.appointmentDate]
  );
  const selectedDateToCompare = useMemo(
    () => selectedDate.split('T')[0],
    [selectedDate]
  );

  const appointmentDot = useMemo(() => (
    <View
      style={[
        styles.todayDot,
        isSelected ? styles.todayBackground : { backgroundColor: mainColor },
      ]}
    />
  ), [isSelected, mainColor]);

  const getAppointmentDot = useCallback(() => {
    if (scheduledAppointment?.appointmentDate) {
      if (
        selectedDateToCompare === appointmentDateToCompare &&
        scheduledAppointment.appointmentTime === value
      ) {
        return appointmentDot;
      }
    }
    return null;
  }, [appointmentDot, scheduledAppointment, appointmentDateToCompare, selectedDateToCompare, value]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { width: timeSlotWidth }, containerStyle]}>
        <Text style={[(isSelected || isBetween) ? styles.selectedText : styles.unSelectedText]}>
          {value}
        </Text>
        {getAppointmentDot()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadii.ml,
  },
  unSelected: {
    backgroundColor: theme.colors.primary200,
  },
  selectedText: {
    color: theme.colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  unSelectedText: {
    color: theme.colors.primary900,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  todayBackground: {
    backgroundColor: theme.colors.primary200,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: theme.borderRadii.l,
  },
});

export default TimeSlot;
