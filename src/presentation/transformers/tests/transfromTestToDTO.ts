import { Test } from '../../../domain/model/test/Test';
import { transformTestResultsToDTO } from './transformTestResultsToDTO';
import { transformTestInterpretationToDTO } from './transformTestInterpretationToDTO';
import { transformTestTypeToSimpleDTO } from './transformTestTypeToSimpleDTO';
import { TestDTO } from '../../dtos/tests/TestDTO';

export function transformTestToDTO(test: Test): TestDTO {
  return {
    id: test.id.value,
    userId: test.userId.value,
    creationTime: test.creationTime,
    creator: {
      userId: test.creatorUserId.value,
      confidence: test.creatorConfidence,
    },
    results: test.results ? transformTestResultsToDTO(test.results) : null,
    testType: transformTestTypeToSimpleDTO(test.testType),
    resultsInterpretations: test.interpretations.map(transformTestInterpretationToDTO),
  };
}
