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

  // Helper: Converts "09:30 AM" to 570 (minutes from midnight)
  const convertToMinutes = (timeString: string | null) => {
    if (!timeString) return -1;
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (hours === 12) {
      hours = modifier === 'AM' ? 0 : 12;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  };

  const isSelected = value === startTime || value === endTime;

  const isBetween = useMemo(() => {
    if (!startTime || !endTime) return false;
    const currentVal = convertToMinutes(value);
    const startVal = convertToMinutes(startTime);
    const endVal = convertToMinutes(endTime);

    // Check range based on numerical values
    return currentVal > startVal && currentVal < endVal;
  }, [value, startTime, endTime]);

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

  const containerStyle = useMemo(() => {
    if (isSelected) return { backgroundColor: mainColor };
    if (isBetween) return { backgroundColor: mainColor + '40' }; // ~25% Opacity
    return styles.unSelected;
  }, [isSelected, isBetween, mainColor]);

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
