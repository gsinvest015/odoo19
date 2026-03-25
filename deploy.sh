#!/bin/bash
# 部署自訂前端到真實 server
#
# 設定區 ── 請填入真實 server 資訊
REMOTE_USER="odoo"
REMOTE_HOST="your-server-ip"
REMOTE_PATH="/opt/odoo/addons/hr_attendance/static"
SSH_KEY=""   # 選填：SSH 金鑰路徑，例如 ~/.ssh/id_rsa

# ─────────────────────────────────────
SRC="/d/Assistant/src/odoo-19.0/addons/hr_attendance/static"

if [ -z "$REMOTE_HOST" ] || [ "$REMOTE_HOST" = "your-server-ip" ]; then
  echo "[deploy] 請先在 deploy.sh 填入 REMOTE_HOST"
  exit 1
fi

SSH_OPT=""
[ -n "$SSH_KEY" ] && SSH_OPT="-i $SSH_KEY"

echo "[deploy] 部署到 $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH ..."

rsync -avz $SSH_OPT \
  "$SRC/attendance_mgmt.html" \
  "$SRC/my_kiosk.html" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

rsync -avz $SSH_OPT \
  "$SRC/src/my_kiosk/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/src/my_kiosk/"

rsync -avz $SSH_OPT \
  "$SRC/src/scss/kiosk/my_kiosk.scss" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/src/scss/kiosk/"

echo "[deploy] 完成"
echo "[deploy] 提醒：若 server 用 Nginx 快取靜態檔，記得清快取或重啟 Odoo"
