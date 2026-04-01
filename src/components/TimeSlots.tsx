import React, { useCallback } from 'react';
import TimeSlot from './TimeSlot';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../utils/theme';

interface Props {
  slotTimes: string[];
  startTime: string | null;
  endTime: string | null;
  setRange: (start: string | null, end: string | null) => void;
  title?: string;
  backgroundColor?: string;
  mainColor?: string;
}

const TimeSlots = ({
  slotTimes,
  startTime,
  endTime,
  setRange,
  title = 'Select time range',
  backgroundColor = theme.colors.white,
}: Props) => {

  // Helper: Same conversion logic to ensure numerical comparison
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

  const onPress = (clickedTime: string) => {
    const clickedVal = convertToMinutes(clickedTime);
    const startVal = convertToMinutes(startTime);

    // 1. If nothing selected or range already full, start new
    if (!startTime || (startTime && endTime)) {
      setRange(clickedTime, null);
    }
    // 2. Deselect if clicking the exact same time
    else if (clickedTime === startTime) {
      setRange(null, null);
    }
    // 3. If clicked time is numerically BEFORE start time, reset start to the earlier time
    else if (clickedVal < startVal) {
      setRange(clickedTime, null);
    }
    // 4. Otherwise, it's a valid end time
    else {
      setRange(startTime, clickedTime);
    }
  };

  const getTimeSlots = useCallback(() => {
    return slotTimes.map((time) => (
      <View style={styles.timeSlotContainer} key={time}>
        <TimeSlot
          onPress={() => onPress(time)}
          value={time}
          startTime={startTime}
          endTime={endTime}
        />
      </View>
    ));
  }, [slotTimes, startTime, endTime]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.titleContainer}>{title}</Text>
      <View style={styles.timeSlotsContainer}>{getTimeSlots()}</View>
    </View>
  );
};

export default TimeSlots;

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.l,
    paddingLeft: theme.spacing.m,
  },
  titleContainer: {
    color: theme.colors.primary600,
    marginBottom: theme.spacing.m,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlotContainer: {
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.sm,
  },
});
