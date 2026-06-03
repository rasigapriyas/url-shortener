import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import api from
  "../services/api";

function Analytics() {

  const {
    shortCode,
  } = useParams();

  const [
    data,
    setData,
  ] = useState(null);

  useEffect(() => {

    fetchAnalytics();

  }, []);

  const fetchAnalytics =
    async () => {

      try {

        const response =
          await api.get(

            `/url/analytics/${shortCode}`

          );

        setData(
          response.data
        );

      }

      catch (error) {

        console.log(
          error.response?.data
        );

      }

    };

  if (!data) {

    return (
      <h2>
        Loading...
      </h2>
    );

  }

  return (

    <div>

      <h1>
        Analytics
      </h1>

      <h3>
        Original URL
      </h3>

      <p>
        {data.originalUrl}
      </p>

      <h3>
        Short Code
      </h3>

      <p>
        {data.shortCode}
      </p>

      <h3>
        Total Clicks
      </h3>

      <p>
        {data.totalClicks}
      </p>

      <h3>
        Status
      </h3>

      <p>
        {data.status}
      </p>

    </div>

  );

}

export default Analytics;