export class Logger {
  constructor(private readonly namespace: string) {}

  #format(subNamespace: string): string {
    return `[${this.namespace}]:[${subNamespace}]: `;
  }

  log(subNamespace: string, ...rest: unknown[]): void {
    console.log(this.#format(subNamespace), ...rest);
  }

  err(subNamespace: string, ...rest: unknown[]): void {
    console.error(this.#format(subNamespace), ...rest);
  }
}