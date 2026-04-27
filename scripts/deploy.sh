#!/usr/bin/env bash
# Deploy blessley.co.uk to DreamHost over SFTP using lftp.
# Usage:
#   scripts/deploy.sh              # interactive: prompts for password, then mirrors changed files
#   scripts/deploy.sh --dry-run    # show what would be uploaded without sending
#
# Environment overrides (all optional):
#   BLESSLEY_SFTP_HOST      (default: vps38575.dreamhostps.com)
#   BLESSLEY_SFTP_USER      (default: dh_uz8ddr)
#   BLESSLEY_SFTP_PATH      (default: /home/dh_uz8ddr/blessley.co.uk)
#   BLESSLEY_SFTP_PASSWORD  (default: prompt interactively)

set -euo pipefail

HOST="${BLESSLEY_SFTP_HOST:-vps38575.dreamhostps.com}"
USER_="${BLESSLEY_SFTP_USER:-dh_uz8ddr}"
REMOTE="${BLESSLEY_SFTP_PATH:-/home/dh_uz8ddr/blessley.co.uk}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL="$(cd "${SCRIPT_DIR}/.." && pwd)"

if ! command -v lftp >/dev/null 2>&1; then
  echo "ERROR: lftp not found. Install it with:  brew install lftp" >&2
  exit 1
fi

DRY_RUN=0
case "${1:-}" in
  --dry-run|-n) DRY_RUN=1 ;;
  "") ;;
  *) echo "Unknown argument: $1" >&2; exit 2 ;;
esac

PASSWORD="${BLESSLEY_SFTP_PASSWORD:-}"
if [[ -z "${PASSWORD}" ]]; then
  read -r -s -p "SFTP password for ${USER_}@${HOST}: " PASSWORD
  echo
fi
if [[ -z "${PASSWORD}" ]]; then
  echo "ERROR: empty password; aborting." >&2
  exit 1
fi

MIRROR_FLAGS="--reverse --only-newer --parallel=4 --verbose"
if [[ "${DRY_RUN}" -eq 1 ]]; then
  MIRROR_FLAGS="${MIRROR_FLAGS} --dry-run"
  echo "[dry run] Listing changes that WOULD be uploaded. Nothing will be sent."
fi

# Files and directories we never want on production.
EXCLUDES=(
  --exclude-glob '.git'
  --exclude-glob '.git/'
  --exclude-glob '.gitignore'
  --exclude-glob '.github'
  --exclude-glob '.github/'
  --exclude-glob '.claude'
  --exclude-glob '.claude/'
  --exclude-glob '.cursor'
  --exclude-glob '.cursor/'
  --exclude-glob '.vscode'
  --exclude-glob '.vscode/'
  --exclude-glob '.idea'
  --exclude-glob '.idea/'
  --exclude-glob '.DS_Store'
  --exclude-glob 'scripts'
  --exclude-glob 'scripts/'
  --exclude-glob 'README.md'
  --exclude-glob '.deploy.env'
  --exclude-glob '*_grid.txt'
  --exclude-glob '*.swp'
  --exclude-glob '*.swo'
)

echo "Local  : ${LOCAL}"
echo "Remote : sftp://${USER_}@${HOST}${REMOTE}"
echo

lftp -u "${USER_},${PASSWORD}" "sftp://${HOST}" <<LFTP
set sftp:auto-confirm yes
set mirror:use-pget-n 4
set net:max-retries 2
set net:reconnect-interval-base 3
lcd "${LOCAL}"
cd "${REMOTE}"
mirror ${MIRROR_FLAGS} ${EXCLUDES[*]}
bye
LFTP

echo
if [[ "${DRY_RUN}" -eq 1 ]]; then
  echo "Dry run complete. Re-run without --dry-run to push."
else
  echo "Deploy complete. Spot-check https://www.blessley.co.uk/"
fi
