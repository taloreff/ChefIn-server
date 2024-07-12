import fs from 'fs';

const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define the time format
function getTime(): string {
    const now = new Date();
    return now.toLocaleString('he');
}

function isError(e: any): e is Error {
    return e && e.stack && e.message;
}

function doLog(level: string, ...args: any[]): void {
    const strs = args.map(arg =>
        (typeof arg === 'string' || isError(arg)) ? arg : JSON.stringify(arg)
    );

    let line = strs.join(' | ');
    line = `${getTime()} - ${level} - ${line} \n`;
    console.log(line);
    fs.appendFile('./logs/backend.log', line, (err) => {
        if (err) console.log('FATAL: cannot write to log file');
    });
}

interface Logger {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}

export const logger: Logger = {
    debug(...args: any[]): void {
        if (process.env.NODE_ENV === 'production') return;
        doLog('DEBUG', ...args);
    },
    info(...args: any[]): void {
        doLog('INFO', ...args);
    },
    warn(...args: any[]): void {
        doLog('WARN', ...args);
    },
    error(...args: any[]): void {
        doLog('ERROR', ...args);
    }
};
