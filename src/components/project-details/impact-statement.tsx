import { ProjectImpactStatement } from '@/__generated__/api/agora.schemas';
import { Heading } from '@/components/ui/headings';
import { categoryNames } from '@/lib/categories';

import { Markdown } from '../common/markdown';

export function ImpactStatement({
  impactStatement,
}: {
  impactStatement: ProjectImpactStatement;
}) {
  const { category, statement } = impactStatement;
  console.log({impactStatement});

  return (
    <>
      <div className="flex flex-col gap-6 mb-12">
        <Heading className="text-xl font-medium" variant="h3">
          Impact Statement
        </Heading>
        <div>
          <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <Heading variant="h1">Category:</Heading>
            <p>{category ? categoryNames[category] : 'N/A'}</p>
          </div>
          <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            {/* <Heading variant="h1">Subcategory:</Heading> */}
            <p>
              <span className="font-semibold">Subcategories:</span>{' '}
              {impactStatement?.subcategory?.join(', ') ?? 'N/A'}
            </p>
          </div>
        </div>
        <p className="text-red-600">
          Applicants were asked to report on impact made between Oct 1, 2023 -
          July 31, 2024. Promises of future deliverables or impact are not
          allowed.
        </p>
      </div>
      {statement?.map(({ question, answer }, index) => (
        <div className="flex flex-col gap-6 mb-12" key={index}>
          <p className="border-l-4 pl-2 border-red-500 font-semibold">
            {question}
          </p>
          <Markdown className="text-gray-700 dark:text-gray-300">
            {answer}
          </Markdown>
        </div>
      ))}
      {/* {statement && (
        <div className="flex flex-col gap-6 mb-12">
          <p className="border-l-4 pl-2 border-red-500 font-semibold">
            {statement.question}
          </p>
          <Markdown className="text-gray-700 dark:text-gray-300">
            {statement.answer}
          </Markdown>
        </div>
      )} */}
    </>
  );
}
