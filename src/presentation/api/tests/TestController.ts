import { accessManagerFactory, addResultsToTest, createTest, getTests } from '../../../application/service';
import { UserId } from '../../../domain/model/user/UserId';
import { ApiError, apiErrorCodes } from '../../dtos/ApiError';
import { transformTestToDTO } from '../../transformers/tests/transfromTestToDTO';
import { transformTestResultsToDTO } from '../../transformers/tests/transformTestResultsToDTO';
import {
  Authorized,
  Body,
  BodyParam,
  CurrentUser,
  Get,
  HttpCode,
  JsonController,
  Param,
  Patch,
  Post,
  UseAfter,
} from 'routing-controllers';
import { TestErrorHandler } from './TestErrorHandler';
import { User } from '../../../domain/model/user/User';
import { TestResultsCommand } from '../../commands/tests/TestResultsCommand';
import { TestCommand } from '../../commands/tests/TestCommand';
import { CREATE_TESTS_WITHOUT_ACCESS_PASS } from '../../../domain/model/authentication/Permissions';
import log from '../../../infrastructure/logging/logger';

@Authorized()
@JsonController('/v1')
@UseAfter(TestErrorHandler)
export class TestController {
  private accessManagerFactory = accessManagerFactory;
  private getTests = getTests;
  private createTest = createTest;
  private addResultsToTest = addResultsToTest;

  @Get('/users/:id/tests')
  async getTestsOfUser(@Param('id') userIdValue: string, @CurrentUser({ required: true }) actor: User) {
    const canAccessUser = await this.canAccessUser(actor, userIdValue);

    if (!canAccessUser) {
      throw new ApiError(404, apiErrorCodes.USER_NOT_FOUND);
    }

    const tests = await this.getTests.byUserId(userIdValue);

    log.info('Viewed tests', { userId: userIdValue, actorId: actor.id.value });

    return tests.map(transformTestToDTO);
  }

  @HttpCode(201)
  @Post('/users/:id/tests')
  async createTestForUser(
    @Param('id') userIdValue: string,
    @Body() testCommand: TestCommand,
    @CurrentUser({ required: true }) actor: User
  ) {
    const canAccessUser = await this.canAccessUser(actor, userIdValue);
    const canCreateWithoutAccess = actor.hasPermission(CREATE_TESTS_WITHOUT_ACCESS_PASS);

    if (!canAccessUser && !canCreateWithoutAccess) {
      throw new ApiError(404, apiErrorCodes.USER_NOT_FOUND);
    }

    const test = await this.createTest.execute(actor, userIdValue, testCommand);

    log.info('Created test', {
      testId: test.id.value,
      testTypeId: test.testType.id.value,
      userId: test.userId.value,
      actorId: test.creatorUserId.value,
    });

    return transformTestToDTO(test);
  }

  @Get('/tests/:id')
  async getTestById(@Param('id') testIdValue: string, @CurrentUser({ required: true }) actor: User) {
    const test = await this.getTests.byId(testIdValue);
    const canAccessUser = await this.canAccessUser(actor, test.userId.value);

    if (!canAccessUser) {
      throw new ApiError(404, apiErrorCodes.TEST_NOT_FOUND);
    }

    log.info('Viewed test', { testId: test.id.value, userId: test.userId.value, actorId: actor.id.value });

    return transformTestToDTO(test);
  }

  @Patch('/tests/:id')
  async updateTestWithResults(
    @Param('id') testIdValue: string,
    @BodyParam('results') resultsCommand: TestResultsCommand,
    @CurrentUser({ required: true }) actor: User
  ) {
    const results = await this.addResultsToTest.execute(actor, testIdValue, resultsCommand);

    log.info('Added results to test', {
      testId: testIdValue,
      actorId: actor.id.value,
    });

    return transformTestResultsToDTO(results);
  }

  private async canAccessUser(actor: User, userIdValue: string) {
    const userId = new UserId(userIdValue);
    return this.accessManagerFactory.forAuthenticatedUser(actor).canAccessUser(userId);
  }
}
