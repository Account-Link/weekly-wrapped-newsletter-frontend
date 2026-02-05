const getTimestamp = () => new Date().toISOString().split("T")[1].slice(0, -1);

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export class Logger {
  private context: string;

  /**
   * Creates a new Logger instance.
   * (创建一个新的 Logger 实例。)
   *
   * @param context - The context name (e.g., module or component name) (上下文名称，例如模块或组件名称)
   */
  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, color: string) {
    return `${colors.dim}[${getTimestamp()}]${colors.reset} ${color}[${level}]${colors.reset} ${colors.bright}[${this.context}]${colors.reset} ${message}`;
  }

  /**
   * Logs an informational message.
   * (记录一般信息日志。)
   */
  info(message: string) {
    console.log(this.formatMessage("INFO", message, colors.blue));
  }

  /**
   * Logs a success message.
   * (记录成功信息日志。)
   */
  success(message: string) {
    console.log(this.formatMessage("SUCCESS", message, colors.green));
  }

  /**
   * Logs a warning message.
   * (记录警告信息日志。)
   */
  warn(message: string) {
    console.warn(this.formatMessage("WARN", message, colors.yellow));
  }

  /**
   * Logs an error message, optionally with an error object.
   * (记录错误信息日志，可选附带错误对象。)
   */
  error(message: string, error?: unknown) {
    console.error(this.formatMessage("ERROR", message, colors.red));
    if (error) {
      console.error(error);
    }
  }

  /**
   * Logs a performance metric.
   * (记录性能指标日志。)
   */
  perf(message: string, durationMs: number) {
    const durationStr = durationMs.toFixed(2) + "ms";
    const coloredDuration =
      durationMs > 1000
        ? `${colors.red}${durationStr}${colors.reset}`
        : durationMs > 200
          ? `${colors.yellow}${durationStr}${colors.reset}`
          : `${colors.green}${durationStr}${colors.reset}`;

    console.log(
      this.formatMessage(
        "PERF",
        `${message} - Duration: ${coloredDuration}`,
        colors.magenta,
      ),
    );
  }

  /**
   * Measures the execution time of an asynchronous operation.
   * Logs start and completion (with duration) or failure.
   * (测量异步操作的执行时间。记录开始、完成（带耗时）或失败。)
   *
   * @param operationName - Name of the operation to measure (要测量的操作名称)
   * @param fn - The function to execute (要执行的函数)
   */
  async measure<T>(
    operationName: string,
    fn: () => Promise<T> | T,
  ): Promise<T> {
    const start = performance.now();
    try {
      this.info(`Starting: ${operationName}...`);
      const result = await fn();
      const end = performance.now();
      this.perf(`${operationName} completed`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.error(
        `${operationName} failed after ${(end - start).toFixed(2)}ms`,
        error,
      );
      throw error;
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
