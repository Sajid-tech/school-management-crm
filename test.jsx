import React, { useEffect, useState } from "react";
import Layout from "../../../layout/Layout";
import axios from "axios";
import { toast } from "sonner";
import { IconArrowBack, IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../base/BaseUrl";
import moment from "moment/moment";

const AttendanceView = () => {
  const navigate = useNavigate();
  const Fromdate = moment().startOf("month").format("YYYY-MM-DD");
  const Todate = moment().format("YYYY-MM-DD");

  const [attendance, setAttendance] = useState({
    from_date: Fromdate,
    to_date: Todate,
    from_class: "",
  });

  const [classList, setClassList] = useState([]);


  const onInputChange = (e) => {
    setAttendance({
      ...attendance,
      [e.target.name]: e.target.value,
    });
  };
  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassList(response.data.classes);
    } catch (error) {
      console.error("Error fetching classes data", error);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById("addIndiv");
    if (!form.checkValidity()) {
      toast.error("Fill all required");

      return;
    }
    const data = {
      from_date: attendance.from_date,
      to_date: attendance.to_date,
      from_class: attendance.from_class,
    };

    axios({
      url: `${BASE_URL}/api/panel-fetch-student-attendance`,
      method: "POST",

      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.data.code == 200) {
        toast.success(res.data.msg);
      } else if (res.data.code == 400) {
        toast.error(res.data.msg);
      }
    });
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
    "w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 border-blue-500";
  return (
    <Layout>
      <div className=" bg-[#FFFFFF] p-2  rounded-lg  ">
        <div className="sticky top-0 p-2  mb-4 border-b-2 border-red-500 rounded-lg  bg-[#E1F5FA] ">
          <h2 className=" px-5 text-[black] text-lg   flex flex-row  justify-between items-center  rounded-xl p-2 ">
            <div className="flex  items-center gap-2">
              <IconInfoCircle className="w-4 h-4" />
              <span>View Attendance </span>
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
          className="w-full   rounded-lg mx-auto p-4 space-y-6 "
        >
          <div className="grid grid-cols-1  md:grid-cols-1 lg:grid-cols-3   gap-6">
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
            <div>
              <FormLabel required>Class</FormLabel>

              <select
                name="from_class"
                value={attendance.from_class || ""}
                onChange={(e) => onInputChange(e)}
                required
                className={inputClassSelect}
              >
                <option value="">Select Class</option>
                {classList.map((option, idx) => (
                  <option key={idx} value={option.classes}>
                    {option.classes}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="submit"
              className="text-center text-sm font-[400] cursor-pointer  w-36 text-white bg-blue-600 hover:bg-green-700 p-2 rounded-lg shadow-md"
            >
         
              Create
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AttendanceView;
