export interface JwtConfig {
  secret: string;
  expiresIn: string | number;
}

export interface JwtPayload {
  id: string;
}
