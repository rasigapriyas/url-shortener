import { useState }
  from "react";

import Input from
  "./Input";

import Button from
  "./Button";

import api from
  "../services/api";

function UrlForm({
  onUrlCreated,
}) {

  const [
    originalUrl,
    setOriginalUrl,
  ] = useState("");

  const handleCreate =
    async () => {

      try {

        const response =
          await api.post(

            "/url/create",

            {
              originalUrl,
            }

          );

        alert(
          response.data.message
        );

        setOriginalUrl("");

        onUrlCreated();

      }

      catch (error) {

        console.log(
          error.response?.data
        );

      }

    };

  return (

    <div>

      <Input

        type="text"

        name="url"

        placeholder=
          "Enter URL"

        value={
          originalUrl
        }

        onChange={(e) =>
          setOriginalUrl(
            e.target.value
          )
        }

      />

      <Button

        text="Create URL"

        onClick={
          handleCreate
        }

      />

    </div>

  );

}

export default UrlForm;