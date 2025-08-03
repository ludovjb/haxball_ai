set -eu
eval "$(direnv export bash)"

echo "With HEADLESS_TOKEN = $HEADLESS_TOKEN"
echo "With NUMBER_OF_BOTS_PER_TEAM = $NUMBER_OF_BOTS_PER_TEAM"

OPERATOR_SCALE=$((NUMBER_OF_BOTS_PER_TEAM * 2))

docker compose build
docker compose up --force-recreate --scale operator=$OPERATOR_SCALE
