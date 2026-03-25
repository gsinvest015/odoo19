#!/bin/bash
# 同步自訂前端到本機 Odoo server（測試用）

SRC="/d/Assistant/src/odoo-19.0/addons/hr_attendance/static"
DST="/d/Assistant/src/odoo/server/odoo/addons/hr_attendance/static"

echo "[sync] 同步前端到本機 server..."

cp -v "$SRC/attendance_mgmt.html"             "$DST/attendance_mgmt.html"
cp -v "$SRC/my_kiosk.html"                    "$DST/my_kiosk.html"
cp -rv "$SRC/src/my_kiosk/."                  "$DST/src/my_kiosk/"
cp -v "$SRC/src/scss/kiosk/my_kiosk.scss"     "$DST/src/scss/kiosk/my_kiosk.scss"

echo "[sync] 完成，重新整理瀏覽器即可（Ctrl+Shift+R）"
