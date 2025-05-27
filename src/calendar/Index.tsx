import React, { useState } from "react";
import moment from "moment";
import {
  StyledCalendarWrapper,
  StyledCalendar,
  StyledDate,
  StyledToday,
  StyledDot,
} from "./styles";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarComponentProps {
  attendDates?: string[]; // 글 등록된 날짜들 (YYYY-MM-DD)
  onDateSelect: (date: string) => void; // 날짜 클릭 시 호출되는 함수
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  attendDates = [], // 기본 빈 배열로 설정
  onDateSelect,
}) => {
  const today = new Date();
  const [date, setDate] = useState<Value>(today);
  const [activeStartDate, setActiveStartDate] = useState<Date | null>(today);

  // attendDates가 datetime 문자열일 경우 YYYY-MM-DD 형식으로 변환된 배열
  const formattedAttendDates = attendDates.map((d) =>
    moment(d).format("YYYY-MM-DD")
  );

  const handleDateChange = (newDate: Value) => {
    setDate(newDate);
    if (newDate instanceof Date) {
      onDateSelect(moment(newDate).format("YYYY-MM-DD"));
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setActiveStartDate(today);
    setDate(today);
    onDateSelect(moment(today).format("YYYY-MM-DD"));
  };

  return (
    <StyledCalendarWrapper>
      <StyledCalendar
        value={date}
        onChange={handleDateChange}
        formatDay={(locale, date) => moment(date).format("D")}
        formatYear={(locale, date) => moment(date).format("YYYY")}
        formatMonthYear={(locale, date) => moment(date).format("YYYY. MM")}
        calendarType="gregory"
        showNeighboringMonth={false}
        next2Label={null}
        prev2Label={null}
        minDetail="year"
        activeStartDate={activeStartDate === null ? undefined : activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        tileContent={({ date, view }) => (
          <>
            {/* 오늘 표시 */}
            {view === "month" &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate() && (
                <StyledToday>오늘</StyledToday>
              )}
            {/* 일기 등록 날짜 점 표시 */}
            {formattedAttendDates.includes(moment(date).format("YYYY-MM-DD")) && (
              <StyledDot />
            )}
          </>
        )}
      />
      {/* 오늘 버튼 */}
      <StyledDate onClick={handleTodayClick}>오늘</StyledDate>
    </StyledCalendarWrapper>
  );
};

export default CalendarComponent;
