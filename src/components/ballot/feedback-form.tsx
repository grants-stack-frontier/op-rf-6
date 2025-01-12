import { ChevronLeft } from 'lucide-react';
import { type PropsWithChildren, useMemo } from 'react';
import {
  FormProvider,
  type UseFormRegister,
  useController,
  useForm,
  useFormContext,
} from 'react-hook-form';

import { useSendFeedback } from '@/hooks/useFeedback';
import { FeedbackForm, FeedbackFormKeyName } from '@/types/feedback';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Heading } from '../ui/headings';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { feedbackFormConfig } from '@/lib/feedbackConfig';

export function Form({
  children,
  defaultValues,
}: PropsWithChildren<{ defaultValues: Record<string, unknown> }>) {
  const form = useForm({ defaultValues });

  return <FormProvider {...form}>{children}</FormProvider>;
}

export function Feedback({ onSubmit = () => {} }: { onSubmit?: () => void }) {
  const form = useFormContext<FeedbackForm & { index: number }>();
  const { handleSubmit, register, setValue, watch } = form;
  const index = watch('index') ?? 0;

  const { mutate, isPending } = useSendFeedback();

  const questions = useMemo(() => createQuestions(register), [register]);
  const { title, description, children, isSkippable } = questions[index];
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (index < questions.length - 1) {
          setValue('index', index + 1);
        } else {
          mutate(values, {
            onSuccess: onSubmit,
            onError: onSubmit, // Skips feedback if error (for testing)
          });
        }
      })}
    >
      <input type="hidden" {...register('index')} />
      <div className="space-y-8">
        <div className="flex justify-center">
          <Badge variant={'secondary'} className="text-muted-foreground">
            {index + 1} of {questions.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <Heading variant={'h3'} className="text-center">
            {title}
          </Heading>
          {description && (
            <p className="text-muted-foreground text-center">{description}</p>
          )}
        </div>
        {children}
        {index > 0 && (
          <Button
            icon={ChevronLeft}
            variant="ghost"
            size={'icon'}
            type="button"
            className="absolute -top-[28px] left-2 rounded-full"
            disabled={index === 0}
            onClick={() => setValue('index', index - 1)}
          />
        )}
        <div className="space-y-2">
          <Button
            className="w-full"
            variant={'destructive'}
            type="submit"
            isLoading={isPending}
            disabled={isPending}
          >
            Continue
          </Button>
          {isSkippable && index < questions.length - 1 && (
            <Button
              variant={'outline'}
              type="button"
              className="w-full"
              onClick={() => setValue('index', index + 1)}
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function createQuestions(
  register: UseFormRegister<FeedbackForm & { index: number }>
) {
  return feedbackFormConfig.formFields
    .filter((field) => field.type !== 'hidden')
    .map((field) => ({
      title: field.title,
      description: field.description,
      isSkippable: field.skippable,
      children:
        field.type === 'select' ? (
          <SelectForm
            key={field.keyName}
            name={field.keyName}
            options={field.options ?? []}
            comment={field.comment}
          />
        ) : (
          <Input
            {...register(field.keyName, { required: true })}
            type={field.type}
            placeholder={field.placeholder}
          />
        ),
    }));
}

function SelectForm({
  name,
  options = [],
  comment,
}: {
  name: FeedbackFormKeyName;
  comment?: {
    keyName: FeedbackFormKeyName;
    placeholder?: string;
  };
  options: { label: string; value: string }[];
}) {
  const { control, register } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <div className="space-y-2">
      <Select
        required
        value={field.value}
        defaultValue={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {comment && (
        <Textarea
          {...register(comment.keyName)}
          placeholder={
            comment.placeholder ??
            'Please feel free to elaborate here. Reminder that these responses are private.'
          }
        />
      )}
    </div>
  );
}
