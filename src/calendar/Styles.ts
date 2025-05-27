// src/Calendar/styles.ts
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export const StyledCalendarWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 4px 2px 10px 0px rgba(0, 0, 0, 0.13);
    padding: 3% 5%;
    background-color: white;
  }

  /* 전체 폰트 컬러 */
  .react-calendar__month-view {
    abbr {
      color: #666666;  /* gray_1 */
    }
  }

  /* 네비게이션 가운데 정렬 */
  .react-calendar__navigation {
    justify-content: center;
  }

  /* 네비게이션 폰트 설정 */
  .react-calendar__navigation button {
    font-weight: 800;
    font-size: 1rem;
  }

  /* 네비게이션 버튼 컬러 */
  .react-calendar__navigation button:focus {
    background-color: white;
  }

  /* 네비게이션 비활성화 됐을때 스타일 */
  .react-calendar__navigation button:disabled {
    background-color: white;
    color: #121212; /* darkBlack */
  }

  /* 년/월 상단 네비게이션 칸 크기 줄이기 */
  .react-calendar__navigation__label {
    flex-grow: 0 !important;
  }

  /* 화살표 색 */ 
  .react-calendar__navigation__arrow {
    color:rgb(0, 0, 0); 
  }

   .react-calendar__navigation__arrow:hover {
    color:rgb(0, 0, 0); /* 화살표 호버 색 */
  }

  /* 요일 밑줄 제거 */
  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
    font-weight: 800;
  }

  /* 일요일에만 빨간 폰트 */
  .react-calendar__month-view__weekdays__weekday--weekend abbr[title="일요일"] {
    color: #ff0000; /* red_1 */
  }

  /* 오늘 날짜 폰트 컬러 */
  .react-calendar__tile--now {
    background: none;
    abbr {
      color:rgb(0, 180, 45); /* primary_2 */
    }
  }
.react-calendar__navigation__label {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgb(0, 0, 0); /* 원하는 글자색 */
  background-color: rgb(255, 255, 255); /* 원하는 배경색 */
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

  /* 네비게이션 월 스타일 적용 */
  .react-calendar__year-view__months__month {
    border-radius: 0.8rem;
    background-color:rgb(255, 255, 255); /* gray_5 */
    padding: 0;
    flex: 0 0 calc(33.3333% - 10px) !important;
    margin-inline-start: 5px !important;
    margin-inline-end: 5px !important;
    margin-block-end: 10px;
    padding: 20px 6.6667px;
    font-size: 0.9rem;
    font-weight: 600;
    color:rgb(75, 45, 45); /* gray_1 */
  }

  /* 네비게이션 현재 월 스타일 적용 */
  .react-calendar__tile--hasActive {
    background-color:rgb(207, 255, 207); /* primary_2 */
    abbr {
      color:rgb(0, 0, 0);
    }
  }

  /* 일 날짜 간격 */
  .react-calendar__tile {
    padding: 5px 0px 18px;
    position: relative;
  }

  /* 선택한 날짜 스타일 적용 */
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus,
  .react-calendar__tile--active {
    background-color:rgb(194, 255, 199); /* yellow_2 */
    border-radius: 0.3rem;
  }
`;

// 캘린더 컴포넌트 스타일링 (필요 시 수정 가능)
export const StyledCalendar = styled(Calendar)``;

// 오늘 버튼 스타일
export const StyledDate = styled.div`
  position: absolute;
  right: 7%;
  top: 6%;
  background-color:rgb(64, 202, 0); /* primary_3 */
  color:rgb(255, 255, 255); /* yellow_2 */
  width: 18%;
  min-width: fit-content;
  height: 1.5rem;
  text-align: center;
  margin: 0 auto;
  line-height: 1.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 800;
`;

// 오늘 날짜에 텍스트 삽입 스타일
export const StyledToday = styled.div`
  font-size: x-small;
  color: #999999; /* br_2 */
  font-weight: 600;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
`;

// 글 등록한 날짜에 점 표시 스타일
export const StyledDot = styled.div`
  background-color:rgb(33, 139, 0); /* br_2 */
  border-radius: 50%;
  width: 0.3rem;
  height: 0.3rem;
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
`;
