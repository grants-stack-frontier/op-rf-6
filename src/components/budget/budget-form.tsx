import React, { useEffect, useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryItem } from "./category-item";
import { useBudgetContext } from "./provider";
import { useRouter } from "next/navigation";
import { Slider } from "../ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetForm() {
  const { categories, error, isLoading, totalBudget, setTotalBudget } =
    useBudgetContext();
  const router = useRouter();

  const [initialLoad, setInitialLoad] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  const handleBudgetChange = (value: number[]) => {
    const newBudget = value[0];
    setTotalBudget(newBudget);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/ballot");
  };

  return (
    <form onSubmit={handleContinue}>
      <CardContent>
        {initialLoad ? (
          <Skeleton className='h-10 w-full mb-4' />
        ) : (
          <div>
            <p className='text-[14px] font-medium'>
              First, choose how much OP should be dedicated to this round
              <span className='text-red-500'>*</span>
            </p>
            <p className='text-[14px] font-normal text-gray-600'>
              Round 5 rewards impact made to the OP Stack from Oct 2023 - Oct
              2024.
            </p>
            <div className='flex items-center my-6'>
              <span className='text-sm'>2M</span>
              <Slider
                className='flex-1 mx-2'
                min={2000000}
                max={8000000}
                step={50000}
                value={[totalBudget]}
                onValueChange={handleBudgetChange}
                trackClassName='bg-gray-300'
                rangeClassName='bg-gray-800'
                thumbClassName='border-gray-600'
              />
              <span className='text-sm'>8M</span>
              <div className='flex rounded-lg bg-[#F2F3F8] border ml-4'>
                <input
                  type='text'
                  value={`${totalBudget.toLocaleString()} OP`}
                  disabled
                  className='w-40 text-center bg-transparent border-0 focus:ring-0 focus:outline-none px-4 py-2'
                />
              </div>
            </div>
            <p className='text-[14px] font-medium'>
              Next, decide how much OP should go to each category
              <span className='text-red-500'>*</span>
            </p>
            <p className='text-[14px] font-normal text-gray-600 mb-2'>
              Divide {totalBudget.toLocaleString()} among three categories.
            </p>
          </div>
        )}
        {initialLoad
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-24 w-full mb-4' />
            ))
          : categories?.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
      </CardContent>
      <CardFooter className='flex flex-col gap-2 items-start'>
        {error && (
          <div className='text-sm text-red-500 mb-2 text-left'>{error}</div>
        )}
        <Button
          variant='secondary'
          type='submit'
          disabled={isLoading}
          className='bg-gray-100 text-black hover:bg-gray-200'
        >
          Continue
        </Button>
      </CardFooter>
    </form>
  );
}
