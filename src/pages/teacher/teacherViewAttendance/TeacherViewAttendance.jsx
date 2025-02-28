import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../layout/Layout";
import axios from "axios";
import { toast } from "sonner";
import { IconArrowBack, IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../base/BaseUrl";
import moment from "moment/moment";
import { useReactToPrint } from "react-to-print";

const TeacherViewAttendance = () => {
  const navigate = useNavigate();
  const Fromdate = moment().startOf("month").format("YYYY-MM-DD");
  const Todate = moment().format("YYYY-MM-DD");
  const componentRef = useRef();

  const [attendance, setAttendance] = useState({
    from_date: Fromdate,
    to_date: Todate,
  });

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onInputChange = (e) => {
    setAttendance({
      ...attendance,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById("addIndiv");
    if (!form || !form.checkValidity()) {
      toast.error("Fill all required fields");
      return;
    }

    const data = {
      from_date: attendance?.from_date,
      to_date: attendance?.to_date,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/api/panel-fetch-teacher-attendance`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API Response:", res.data);

      if (res.data.weekdays && res.data.teacher) {
        setAttendanceData(res.data);
        // toast.success("Attendance data fetched successfully!");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  const toggleAttendance = async (teacher, date) => {
    const isHoliday = attendanceData.weekdays.find(
      (day) => day.date === date.date && day.holiday_for
    );
    if (isHoliday) return;

    const isAbsent = teacher.attendance_dates.includes(date.date);

    try {
      setLoading(true);
      // if the date is Absent
      if (isAbsent) {
        const attendanceIndex = teacher.attendance_dates.indexOf(date.date);
        const attendanceId = teacher.id[attendanceIndex];

        await axios({
          url: `${BASE_URL}/api/panel-delete-teacher-attendance/${attendanceId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        toast.success(
          `${teacher.teacher_name} marked present for ${moment(
            date.date
          ).format("DD MMM YYYY")}`
        );
      } else {
        const data = {
          teacherAttendance_date: date.date,
          teacher_ref: teacher.teacher_ref,
        };
        console.log(data);
        // else if the date is P
        await axios({
          url: `${BASE_URL}/api/panel-create-teacher-attendance`,
          method: "POST",
          data,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        toast.success(
          `${teacher.teacher_name} marked absent for ${moment(date.date).format(
            "DD MMM YYYY"
          )}`
        );
      }

      handleSubmit(new Event("submit"), false);
    } catch (error) {
      console.error("Error toggling attendance:", error);
      toast.error("Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };
  const FormLabel = ({ children, required }) => (
    <label className="block text-sm font-semibold text-black mb-1 ">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const inputClassSelect =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-blue-500";
  const inputClass =
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-blue-500";
  const handlPrintPdf = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Addendance",
    pageStyle: `
                    @page {
                    size: A4 landscape;
                    margin: 5mm;
                    
                  }
                  @media print {
                    body {
                      border: 0px solid #000;
                          font-size: 10px; 
                      margin: 0mm;
                      padding: 0mm;
                      min-height: 100vh;
                    }
                       table {
                       font-size: 11px;
                     }
                    .print-hide {
                      display: none;
                    }
                   
                  }
                  `,
  });
  return (
    <Layout>
      <div className="bg-[#FFFFFF] p-2 rounded-lg">
        <div className="sticky top-0 p-2 mb-4 border-b-2 border-red-500 rounded-lg bg-[#E1F5FA]">
          <h2 className="px-5 text-[black] text-lg flex flex-row justify-between items-center rounded-xl p-2">
            <div className="flex items-center gap-2">
              <IconInfoCircle className="w-4 h-4" />
              <span>Teacher Attendance </span>
            </div>
            <IconArrowBack
              onClick={() => navigate("/attendance-list")}
              className="cursor-pointer hover:text-red-600"
            />
          </h2>
        </div>
        <hr />
        <form
          onSubmit={handleSubmit}
          id="addIndiv"
          className="w-full rounded-lg mx-auto p-4 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <FormLabel required>From Date</FormLabel>
              <input
                type="date"
                name="from_date"
                value={attendance.from_date}
                onChange={(e) => onInputChange(e)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <FormLabel required>To Date</FormLabel>
              <input
                type="date"
                name="to_date"
                value={attendance.to_date}
                onChange={(e) => onInputChange(e)}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="submit"
              className="text-center text-sm font-[400] cursor-pointer w-36 text-white bg-blue-600 hover:bg-green-700 p-2 rounded-lg shadow-md"
            >
              View
            </button>
          </div>
        </form>
        {attendanceData && (
          <div className="mt-6">
            <div className=" flex justify-between">
              <h3 className="text-lg font-bold">Attendance List</h3>
              <div className="flex space-x-3">
                <div className="flex items-center gap-1 text-xs">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
                  <span>Holiday</span>
                </div>

                <button
                  onClick={handlPrintPdf}
                  className="text-center text-sm font-[400] cursor-pointer w-36 text-white bg-blue-600 hover:bg-green-700 p-2 rounded-lg shadow-md"
                  type="button"
                >
                  Print
                </button>
              </div>
            </div>
            <div ref={componentRef}>
              <h3 className="text-lg font-bold print:block hidden text-center">
                Attendance List
              </h3>
              {Object.entries(
                attendanceData.weekdays.reduce((acc, item) => {
                  const month = moment(item.date).format("MMMM YYYY");
                  acc[month] = acc[month] || [];
                  acc[month].push(item);
                  return acc;
                }, {})
              ).map(([month, dates]) => (
                <div key={month} className="mt-4">
                  <h4 className="text-md font-semibold">{month}</h4>
                  <table className="w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-2 text-xs p-1">
                          Student
                        </th>
                        {dates.map((date) => (
                          <th
                            key={date.date}
                            className="border border-gray-300 text-xs p-1 "
                          >
                            {moment(date.date).format("DD")}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {attendanceData.teacher.map((teacher, teacherIndex) => (
                        <tr key={teacher.teacher_name}>
                          <td className="border border-gray-300  text-center text-xs p-1 ">
                            {teacher.teacher_name}
                          </td>

                          {dates.map((date, dateIndex) => {
                            if (teacherIndex === 0 && date.holiday_for) {
                              return (
                                <td
                                  key={date.date}
                                  className="border border-gray-300 p-1   text-center align-middle font-bold bg-yellow-400 text-xs"
                                  rowSpan={attendanceData.teacher.length}
                                  style={{
                                    writingMode: "vertical-rl",
                                    textOrientation: "upright",
                                  }}
                                >
                                  {date.holiday_for}
                                </td>
                              );
                            }

                            if (date.holiday_for) {
                              return null;
                            }
                            const isAbsent = teacher.attendance_dates.includes(
                              date.date
                            );
                            return (
                              <td
                                key={date.date}
                                onClick={() => {
                                  console.log(
                                    "Teacher:",
                                    teacher,
                                    "Date:",
                                    date
                                  );
                                  toggleAttendance(teacher, date);
                                }}
                                className={`border border-gray-300 p-1 text-center font-bold text-xs cursor-pointer hover:bg-gray-100 attendance-cell ${
                                  loading
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                                }`}
                              >
                                {/* {teacher.attendance_dates.includes(
                                  date.date
                                ) ? (
                                  <span className="text-red-500">A</span>
                                ) : (
                                  <span className="text-green-500">P</span>
                                )} */}
                                {isAbsent ? (
                                  <span className="text-red-500">A</span>
                                ) : (
                                  <span className="text-green-500">P</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherViewAttendance;
