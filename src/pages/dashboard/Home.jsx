import React, { useContext, useEffect, useState } from "react";
import { FileText, Users, Briefcase } from "lucide-react";
import Layout from "../../layout/Layout";
import BASE_URL from "../../base/BaseUrl";
import { ContextPanel } from "../../context/ContextPanel";

const StatCard = ({ title, value, icon: Icon, color = "yellow" }) => (
  <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-600 font-medium text-sm md:text-base">{title}</h3>
      <Icon className={`h-6 w-6 text-${color}-500`} />
    </div>
    <div className="mt-2">
      <p className="text-2xl md:text-3xl font-bold text-gray-800">{value || 0}</p>
    </div>
  </div>
);


const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
  </div>
);

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const {selectedYear}= useContext(ContextPanel)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        const response = await fetch(`${BASE_URL}/api/panel-fetch-dashboard/${selectedYear}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setErrorMessage(err.message || "Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Error state handling
  if (errorMessage) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="bg-red-100 p-4 rounded-lg text-red-800">
            <p className="font-medium">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Total Students" 
              value={dashboardData?.allstudentCount} 
              icon={Users} 
            />
            <StatCard 
              title="Current Students" 
              value={dashboardData?.currentstudentCount} 
              icon={FileText} 
              color="blue"
            />
            <StatCard 
              title="Total Teachers" 
              value={dashboardData?.allteacherCount} 
              icon={Briefcase} 
              color="green"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;