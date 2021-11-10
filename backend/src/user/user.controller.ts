import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";

@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {

  }
}