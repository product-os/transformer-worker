const HEARTBEAT_PERIOD = 10000;

export const initializeHeartbeat = () => {
	setInterval(() => {
		try {
			// report to JF
		} catch (err) {
			// handle error, probably just log/report to sentry
		}
	}, HEARTBEAT_PERIOD);
};
