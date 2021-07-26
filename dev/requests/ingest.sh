[ -z "$CONTEXT_PATH" ] || CONTEXT_PATH="$CONTEXT_PATH/"
[ -z "$CATALOG_HOSTNAME" ] && CATALOG_HOSTNAME="localhost"

until curl -s -o /dev/null http://$CATALOG_HOSTNAME:8080/health; do
  >&2 echo "ODD Platform is unavailable - sleeping for 1 second"
  sleep 1
done

for data_source in "${CONTEXT_PATH}ds"/*
do
  curl \
    -H "Content-Type: application/json" \
    -d @"$data_source" \
    -X POST \
    http://$CATALOG_HOSTNAME:8080/api/datasources

  echo '\n'
done

for data in "${CONTEXT_PATH}data"/*
do
  curl \
    -H "Content-Type: application/json" \
    -d @"$data" \
    -X POST \
    http://$CATALOG_HOSTNAME:8080/ingestion/entities

  echo '\n'
done