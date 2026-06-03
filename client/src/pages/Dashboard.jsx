import {
  useEffect,
  useState,
} from "react";

import api from
  "../services/api";

import UrlForm from
  "../components/UrlForm";

import UrlTable from
  "../components/UrlTable";

import StatsCard from
  "../components/StatsCard";
  import LogoutButton from
  "../components/LogoutButton";

function Dashboard() {

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);

  const fetchDashboard =
    async () => {

      try {

        const response =
          await api.get(
            "/url/dashboard"
          );

        setDashboardData(
          response.data
        );

      }

      catch (error) {

        console.log(
          error.response?.data
        );

      }

    };

  useEffect(() => {

    fetchDashboard();

  }, []);

  if (
    !dashboardData
  ) {

    return (
      <h2>
        Loading...
      </h2>
    );

  }

  return (

    <div>

      <h1>
  Dashboard
</h1>

<LogoutButton />

      <StatsCard

        title="Total URLs"

        value={
          dashboardData
            .totalUrls
        }

      />

      <StatsCard

        title="Total Clicks"

        value={
          dashboardData
            .totalClicks
        }

      />

      <UrlForm

        onUrlCreated={
          fetchDashboard
        }

      />

      <UrlTable

        urls={
          dashboardData.urls
        }

        onDelete={
          fetchDashboard
        }

      />

    </div>

  );

}

export default Dashboard;