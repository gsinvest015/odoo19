import { App, whenReady, Component, useState, onWillUnmount } from "@odoo/owl";
import { makeEnv, startServices } from "@web/env";
import { getTemplate } from "@web/core/templates";
import { appTranslateFn } from "@web/core/l10n/translation";
import { MainComponentsContainer } from "@web/core/main_components_container";
import { rpc } from "@web/core/network/rpc";
import { session } from "@web/session";

const { DateTime } = luxon;

class MyKioskApp extends Component {
    static template = "hr_attendance.MyKioskApp";
    static components = { MainComponentsContainer };
    static props = {
        employeeData: Object,
        companyImageUrl: String,
    };

    setup() {
        const now = DateTime.now();
        this.state = useState({
            attendanceState: this.props.employeeData.attendance_state,
            loading: false,
            success: false,
            successAction: "",
            time: now.toLocaleString(DateTime.TIME_WITH_SECONDS),
            date: now.toLocaleString({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        });

        const interval = setInterval(() => {
            const n = DateTime.now();
            this.state.time = n.toLocaleString(DateTime.TIME_WITH_SECONDS);
            this.state.date = n.toLocaleString({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
        }, 1000);

        onWillUnmount(() => clearInterval(interval));
    }

    get isCheckedIn() {
        return this.state.attendanceState === "checked_in";
    }

    async toggleAttendance() {
        if (this.state.loading) return;
        this.state.loading = true;
        const wasCheckedIn = this.isCheckedIn;

        try {
            let params = {};
            if (this.props.employeeData.device_tracking_enabled && navigator.geolocation) {
                params = await this._getGeoParams();
            }
            const result = await rpc("/hr_attendance/systray_check_in_out", params);
            if (result) {
                this.state.attendanceState = result.attendance_state;
                this.state.successAction = wasCheckedIn ? "out" : "in";
                this.state.success = true;
                setTimeout(() => { this.state.success = false; }, 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.state.loading = false;
        }
    }

    _getGeoParams() {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => resolve({ latitude, longitude }),
                () => resolve({}),
                { enableHighAccuracy: true, timeout: 3000 }
            );
        });
    }
}

export async function createMyKiosk(document, employeeData, companyImageUrl, serverVersionInfo) {
    await whenReady();
    const env = makeEnv();
    await startServices(env);
    if (serverVersionInfo) {
        session.server_version_info = serverVersionInfo;
    }
    const app = new App(MyKioskApp, {
        getTemplate,
        env,
        props: { employeeData, companyImageUrl },
        dev: env.debug,
        translateFn: appTranslateFn,
        translatableAttributes: ["data-tooltip"],
    });
    return app.mount(document.body);
}

export default { MyKioskApp, createMyKiosk };
