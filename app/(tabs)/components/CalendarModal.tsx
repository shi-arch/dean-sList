import Assets from "@/assets";
import React, { ReactElement, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  availabilityDates: Date[];
  nextAvailableDate: Date | null;
  currentDate: Date;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  availabilityDates,
  nextAvailableDate,
  currentDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date(currentDate));

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
    );
  };

  // Change the days array type from JSX.Element[] to ReactElement[]
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days: ReactElement[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateForDay = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        day
      );
      const isBooked = availabilityDates.some(
        (d) =>
          d.getDate() === currentDateForDay.getDate() &&
          d.getMonth() === currentDateForDay.getMonth() &&
          d.getFullYear() === currentDateForDay.getFullYear()
      );
      const isAvailable = nextAvailableDate
        ? currentDateForDay.getTime() === nextAvailableDate.getTime()
        : false;

      // Disable past dates
      const isPast = currentDateForDay < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

      // Check if it's today (using currentDate prop)
      const isToday =
        currentDateForDay.getDate() === currentDate.getDate() &&
        currentDateForDay.getMonth() === currentDate.getMonth() &&
        currentDateForDay.getFullYear() === currentDate.getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          className={`w-10 h-10 items-center justify-center rounded-full m-1 ${
            isPast
              ? "bg-transparent"
              : isBooked
              ? "bg-red-500"
              : isAvailable
              ? "border-2 border-blue-500"
              : isToday
              ? "border-2 border-blue-500 bg-blue-100"
              : "bg-transparent"
          }`}
          disabled={isPast}
        >
          <Text
            className={`text-base font-medium ${
              isPast
                ? "text-gray-300"
                : isBooked
                ? "text-white"
                : isAvailable
                ? "text-blue-500 font-bold"
                : isToday
                ? "text-blue-600 font-bold"
                : "text-gray-900"
            }`}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Ensure the grid has enough slots to complete the last row
    const totalSlots = days.length;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      days.push(<View key={`empty-end-${i}`} className="w-10 h-10" />);
    }

    return days;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50 px-4"
        activeOpacity={1}
        onPress={onClose} // Close modal on outside tap
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // Prevent closing when tapping inside the modal
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg"
        >
          {/* Header */}
          <View className="flex-row justify-between mb-6 bg-gray-100 p-3 rounded-lg m-0">
            <Text className="text-gray-600 text-lg font-medium mb-1">
              Latest Availability:
            </Text>
            <Text className="text-gray-900 text-lg font-semibold">
              {nextAvailableDate
                ? nextAvailableDate.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Not Available"}
            </Text>
          </View>

          {/* Calendar Navigation */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handlePrevMonth} className="p-2">
              <Assets.icons.leftArrow height={20} width={20} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              {selectedMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} className="p-2">
              <Assets.icons.rightArrow height={20} width={20} />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View className="mb-4">
            {/* Days of week header */}
            <View className="flex-row justify-between mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <View key={index} className="w-10 items-center">
                  <Text className="text-gray-500 text-sm font-medium py-2">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar days in rows */}
            <View className="flex-row flex-wrap justify-between">
              {renderCalendar()}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CalendarModal;