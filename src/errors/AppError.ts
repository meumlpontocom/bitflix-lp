/**
 * Hierarquia de erros de aplicação. Diferenciados por mensagem (não por classe).
 * Lançados apenas a partir de Facades; o handler de erro converte em response HTTP.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}
