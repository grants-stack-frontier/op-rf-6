import { Heading } from '@/components/ui/headings';

import { CustomAccordion } from '../common/custom-accordion';
import { Card, CardContent } from '../ui/card';

export function PricingModel({
  pricingModel,
  pricingModelDetails,
}: {
  pricingModel?: string;
  pricingModelDetails?: string;
}) {
  if (!pricingModel) return null;

  const formatType = (type: string) => {
    if (type === 'pay_to_use') {
      return type.replace(/_/g, '-');
    }
    if (type === 'freemium') {
      return 'Freemium';
    }
    return type.replace(/_/g, ' ');
  };

  const isFreemiumOrFree = (model: string) => {
    return model === 'freemium' || model === 'free';
    // if (typeof model === 'string') {
    //   return model === 'freemium' || model === 'free';
    // }
    // return model.type === 'free' || model.type === 'freemium';
  };

  const getType = (model: string) => {
    return model;
    // if (typeof model === 'string') {
    //   return model;
    // }
    // return model.type;
  };

  // const getDetails = (model: string) => {
  //   if (typeof model === 'string') {
  //     return null;
  //   }
  //   return model.details;
  // };

  const type = getType(pricingModel);
  const details = pricingModelDetails;
  // const details = getDetails(pricingModel);

  return (
    <div className="flex flex-col gap-2 mb-12">
      <Heading className="text-sm font-medium leading-5" variant="h1">
        Pricing Model
      </Heading>
      {isFreemiumOrFree(pricingModel) && !details ? (
        <Card className="shadow-none">
          <CardContent className="py-2.5 px-3">
            <div className="capitalize text-sm font-medium leading-5">
              {formatType(type ?? '')}
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomAccordion
          value={type ?? ''}
          trigger={
            <div className="capitalize text-sm font-medium leading-5">
              {formatType(type ?? '')}
            </div>
          }
        >
          <div className="p-2">{details}</div>
        </CustomAccordion>
      )}
    </div>
  );
}
