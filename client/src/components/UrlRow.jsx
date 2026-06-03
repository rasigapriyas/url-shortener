import { useNavigate }
  from "react-router-dom";

import api from
  "../services/api";

function UrlRow({
  url,
  onDelete,
}) {

  const navigate =
    useNavigate();

  const handleCopy =
    () => {

      const shortUrl =

        `http://localhost:5000/${url.shortCode}`;

      navigator
        .clipboard
        .writeText(
          shortUrl
        );

      alert(
        "URL Copied"
      );

    };

  const handleDelete =
    async () => {

      try {

        await api.delete(

          `/url/${url.id}`

        );

        onDelete();

      }

      catch (error) {

        console.log(

          error.response?.data

        );

      }

    };

  const handleAnalytics =
    () => {

      navigate(

        `/analytics/${url.shortCode}`

      );

    };

  return (

    <tr>

      <td>

        <a

          href={
            `http://localhost:5000/${url.shortCode}`
          }

          target="_blank"

          rel="noreferrer"

        >

          {
            `http://localhost:5000/${url.shortCode}`
          }

        </a>

      </td>

      <td>

        {url.originalUrl}

      </td>

      <td>

        {url.totalClicks}

      </td>

      <td>

        <button

          onClick={
            handleCopy
          }

        >

          Copy

        </button>

        <button

          onClick={
            handleAnalytics
          }

        >

          Analytics

        </button>

        <button

          onClick={
            handleDelete
          }

        >

          Delete

        </button>

      </td>

    </tr>

  );

}

export default UrlRow;