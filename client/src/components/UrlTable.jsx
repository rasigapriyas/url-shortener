import UrlRow from
  "./UrlRow";

function UrlTable({
  urls,
  onDelete,
}) {

  return (

    <table>

      <thead>

        <tr>

          <th>
            Short Code
          </th>

          <th>
            Original URL
          </th>

          <th>
            Clicks
          </th>

          <th>
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {urls.map(
          (url) => (

            <UrlRow

              key={url.id}

              url={url}

              onDelete={
                onDelete
              }

            />

          )
        )}

      </tbody>

    </table>

  );

}

export default UrlTable;