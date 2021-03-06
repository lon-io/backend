import { createTestType, getTestTypes, updateTestType } from '../../../application/service';
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  HttpCode,
  JsonController,
  Param,
  Patch,
  Post,
  UseAfter,
  UseBefore,
} from 'routing-controllers';
import { hasPermission } from '../../middleware/hasPermission';
import { CREATE_TEST_TYPE, UPDATE_TEST_TYPE } from '../../../domain/model/authentication/Permissions';
import { transformTestTypeToDTO } from '../../transformers/tests/transformTestTypeToDTO';
import { TestTypeErrorHandler } from './TestTypeErrorHandler';
import { User } from '../../../domain/model/user/User';
import { UpdateTestTypeCommand } from '../../commands/tests/UpdateTestTypeCommand';
import { CreateTestTypeCommand } from '../../commands/tests/CreateTestTypeCommand';

@Authorized()
@JsonController('/v1/test-types')
@UseAfter(TestTypeErrorHandler)
export class TestTypeController {
  private getTestTypes = getTestTypes;
  private createTestType = createTestType;
  private updateTestType = updateTestType;

  @Get('')
  async getTestsOfUser(@CurrentUser({ required: true }) actor: User) {
    const testTypes = await this.getTestTypes.forPermissions(actor.permissions);

    return testTypes.map(transformTestTypeToDTO);
  }

  @Post('')
  @HttpCode(201)
  @UseBefore(hasPermission(CREATE_TEST_TYPE))
  async createTestForUser(@Body() command: CreateTestTypeCommand) {
    const testType = await this.createTestType.execute(command);

    return transformTestTypeToDTO(testType);
  }

  @Patch('/:id')
  @UseBefore(hasPermission(UPDATE_TEST_TYPE))
  async updateTestWithResults(@Param('id') testTypeId: string, @Body() command: UpdateTestTypeCommand) {
    const testType = await this.updateTestType.execute(testTypeId, command);
    return transformTestTypeToDTO(testType);
  }
}
