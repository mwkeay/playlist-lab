export interface LoggerObject {
	message: string,
	args: []
}

export enum LogLevel {
	Debug,
	Info,
	Warn,
	Error,
}

const LOG_COLORS = {
	none: "\x1b[0m",
	time: "\x1b[0m",
	debug: "\x1b[36m",
	info: "\x1b[0m",
	warn: "\x1b[33m",
	error: "\x1b[31m",
};

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
	const time = new Date().toLocaleTimeString();
	switch (level) {
		case LogLevel.Debug:
			console.debug(LOG_COLORS.none + "[" + LOG_COLORS.debug + "DEBUG" + LOG_COLORS.none + "] " + LOG_COLORS.time + time + LOG_COLORS.none + " " + message, ...args);
			break;
		case LogLevel.Info:
			console.info(LOG_COLORS.none + "[" + LOG_COLORS.info + "INFO" + LOG_COLORS.none + "] " + LOG_COLORS.time + time + LOG_COLORS.none + " " + message, ...args);
			break;
		case LogLevel.Warn:
			console.warn(LOG_COLORS.none + "[" + LOG_COLORS.warn + "WARN" + LOG_COLORS.none + "] " + LOG_COLORS.time + time + LOG_COLORS.none + " " + message, ...args);
			break;
		case LogLevel.Error:
			console.error(LOG_COLORS.none + "[" + LOG_COLORS.error + "ERROR" + LOG_COLORS.none + "] " + LOG_COLORS.time + time + LOG_COLORS.none + " " + message, ...args);
			break;
	}
};

export const debug = (message: string, ...args: unknown[]) =>
	log(LogLevel.Debug, message, ...args);

export const info = (message: string, ...args: unknown[]) =>
	log(LogLevel.Info, message, ...args);

export const warn = (message: string, ...args: unknown[]) =>
	log(LogLevel.Warn, message, ...args);

export const error = (message: string, ...args: unknown[]) =>
	log(LogLevel.Error, message, ...args);

export const Logger = {
	debug,
	info,
	warn,
	error,
};
  
export default Logger;
