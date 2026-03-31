import React, { useCallback } from 'react';
import TimeSlot from './TimeSlot';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../utils/theme';
import { start } from 'node:repl';

interface Props {
  slotTimes: string[];
  startTime: string | null; // Changed
  endTime: string | null;   // Added
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
  title = 'Select time',
  backgroundColor = theme.colors.white,
}: Props) => {
  const onPress = (clickedTime: string) => {
    if (!startTime || (startTime && endTime)) {
      // Start a new selection if nothing is selected or if a range was already complete
      setRange(clickedTime, null);
    } else if (clickedTime < startTime) {
      // If they click a time BEFORE the start, make that the new start
      setRange(clickedTime, null);
    } else if (clickedTime === startTime) {
      // Deselect if they click the same one
      setRange(null, null);
    } else {
      // It's after the start, so it's the end!
      setRange(startTime, clickedTime);
    }
  };

  const getTimeSlots = useCallback(() => {
    return slotTimes.map((time) => {
      return (
        <View style={styles.timeSlotContainer} key={time}>
          <TimeSlot
            onPress={() => onPress(time)}
            value={time}
            startTime={startTime} // Pass these down
            endTime={endTime}     // Pass these down
          />
        </View>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
