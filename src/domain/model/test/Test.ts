import { UserId } from '../user/UserId';
import { TestTypeId } from '../testType/TestTypeId';
import { TestId } from './TestId';
import { Results } from './Results';

export class Test {
  constructor(
    public id: TestId,
    public userId: UserId,
    public testTypeId: TestTypeId,
    readonly creationTime: Date = new Date(),
    public results?: Results
  ) {}
}