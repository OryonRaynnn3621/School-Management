"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

moment.locale("vi");
const localizer = momentLocalizer(moment);


const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      view={view}
      views={["work_week", "day"]}
      onView={handleOnChangeView}
      style={{ height: "98%" }}
      // Giờ bắt đầu: 8:00 Sáng
      min={new Date(2025, 1, 0, 8, 0)}
      // SỬA Ở ĐÂY: Đổi 17 thành 21 (9:00 Tối) hoặc 22 (10:00 Tối) cho thoáng
      max={new Date(2025, 1, 0, 22, 0)}
      messages={{
        work_week: "Tuần làm việc",
        day: "Ngày",
        next: "Tiếp",
        previous: "Trước",
        today: "Hôm nay",
        month: "Tháng",
        week: "Tuần",
        agenda: "Lịch biểu",
      }}
      formats={{
        dayRangeHeaderFormat: ({ start, end }) =>
          `${moment(start).format("DD/MM")} - ${moment(end).format("DD/MM")}`,
        dayHeaderFormat: (date) => moment(date).format("DD/MM"),
      }}
    />
  );
};


export default BigCalendar;