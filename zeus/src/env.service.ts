import { Injectable } from '@nestjs/common'

@Injectable()
export class EnvService {
  public apolloService: string
  public poseidonService: string
  public apiKey: string

  constructor() {
    this.apolloService = process.env.APOLLO_SERVICE
    this.poseidonService = process.env.POSEIDON_SERVICE
    this.apiKey = process.env.API_KEY
  }
}
