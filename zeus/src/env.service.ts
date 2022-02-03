import { Injectable } from '@nestjs/common'

@Injectable()
export class EnvService {
  private _apolloService: string
  public get apolloService(): string {
    return this._apolloService
  }
  public set apolloService(value: string) {
    this._apolloService = value
  }

  private _poseidonService: string
  public get poseidonService(): string {
    return this._poseidonService
  }
  public set poseidonService(value: string) {
    this._poseidonService = value
  }

  constructor() {
    this._apolloService = process.env.APOLLO_SERVICE
    this._poseidonService = process.env.POSEIDON_SERVICE
  }
}
