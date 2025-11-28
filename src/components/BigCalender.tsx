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
      min={new Date(2025, 1, 0, 8, 0)}
      max={new Date(2025, 1, 0, 17, 0)}
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
        // Format tiêu đề "November 24 – 28"
        dayRangeHeaderFormat: ({ start, end }) =>
          `${moment(start).format("DD/MM")} - ${moment(end).format("DD/MM")}`,

        // Format ngày tiêu đề
        dayHeaderFormat: (date) => moment(date).format("DD/MM"),
      }}
    />
  );
};


export default BigCalendar;
