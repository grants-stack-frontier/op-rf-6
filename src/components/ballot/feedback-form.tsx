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
import { FeedbackForm } from '@/types/various';

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
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

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

function Behaviors() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { field } = useController({
    name: "behaviors",
    control,
    rules: { required: "At least one must be selected" },
  });

  const error = String(errors[field.name]?.message);
  return (
    <div className="">
      <div className="space-y-2 mb-4">
        {[
          {
            id: "collusion",
            label:
              "Collusion (e.g., secret cooperation among badgeholders for a dishonest purpose)",
          },
          {
            id: "bribery",
            label:
              "Bribery (e.g., promising something in return for voting in a particular way)",
          },
          {
            id: "self-dealing",
            label:
              "Self-dealing (e.g., voting in someone’s self-interest rather than in the ecosystem’s interest)",
          },
          {
            id: "other",
            label: "Other behaviors that are detrimental to the Collective",
          },
          { id: "none", label: "None of the above" },
        ].map((item, i) => (
          <label key={i} htmlFor={item.id} className="block cursor-pointer">
            <Card className="px-4 py-3 flex gap-2 items-center w-full">
              <Checkbox
                id={item.id}
                checked={field.value?.includes(item.id)}
                onCheckedChange={(checked) => {
                  console.log("checked ", checked);
                  checked
                    ? field.onChange([...(field.value ?? []), item.id])
                    : field.onChange(
                        field.value.filter((v: string) => v !== item.id)
                      );
                }}
              />
              {item.label}
            </Card>
          </label>
        ))}
      </div>
      <Textarea
        {...register("behaviorsComment")}
        placeholder="Please feel free to elaborate here. Reminder that these responses are anonymous..."
      />
      <div className="text-destructive text-sm pt-4">{error}</div>
    </div>
  );
}

function createQuestions(
  register: UseFormRegister<FeedbackForm & { index: number }>
) {
  return [
    {
      title: 'How much time did you spend on voting in this round (in hours)?',
      children: (
        <Input
          {...register('votingTime', { required: true })}
          type="number"
          placeholder="Ex: 10 hours"
        />
      ),
    },
    {
      title: 'Please rate the voting experience',
      children: (
        <SelectForm
          key="voting"
          name="voting"
          hideComment
          options={Array(10)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0 ? '(terrible)' : index === 9 ? '(amazing ✨)' : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title:
        'Did the app provide you enough information to confidently vote on the budget?',
      children: (
        <SelectForm
          key="budgetConfidence"
          name="budgetConfidence"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(definitely not)'
                  : index === 3
                    ? '(somewhat)'
                    : index === 6
                      ? '(absolutely)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title:
        'How useful was scoring each project before unlocking your ballot?',
      description: 'If you used Pairwise, skip this question.',
      isSkippable: true,
      children: (
        <SelectForm
          key="scoringUsefulness"
          name="scoringUsefulness"
          commentPlaceholder="Optionally, how would you change or improve the scoring step? Reminder that these responses are private."
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(not useful at all)'
                  : index === 3
                    ? '(somewhat useful)'
                    : index === 6
                      ? '(very useful)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title: 'How useful were allocation methods for determining your ballot?',
      children: (
        <SelectForm
          key="allocationMethodsUsefulness"
          name="allocationMethodsUsefulness"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(not useful at all)'
                  : index === 3
                    ? '(somewhat useful)'
                    : index === 6
                      ? '(very useful)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title: `Did you observe any behavior among your fellow badgeholders that could be considered one of the following (select all that apply)?`,
      children: <Behaviors />,
    },
    {
      title:
        'How worried are you about detrimental behavior among badgeholders influencing the allocation of Retro Funding in this round?',
      description:
        'Examples are collusion, bribery, self-dealing, or other behaviors at odds with the goals of the Collective.',
      children: (
        <SelectForm
          key="concern"
          name="concern"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(not worried)'
                  : index === 3
                    ? '(somewhat worried)'
                    : index === 6
                      ? '(very worried)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title:
        'Given the design of this round, how confident do you feel that OP rewards will be allocated efficiently to the most deserving projects?',
      children: (
        <SelectForm
          key="confidence"
          name="confidence"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(very low confidence)'
                  : index === 3
                    ? '(some confidence)'
                    : index === 6
                      ? '(very high confidence)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
    {
      title: 'To what extent do you trust the opinions of other badgeholders?',
      children: (
        <SelectForm
          key="trust"
          name="trust"
          options={Array(7)
            .fill(0)
            .map((_, index) => ({
              label: `${index + 1} ${
                index === 0
                  ? '(very low trust)'
                  : index === 3
                    ? '(moderate trust)'
                    : index === 6
                      ? '(very high trust)'
                      : ''
              }`,
              value: String(index + 1),
            }))}
        />
      ),
    },
  ];
}

function SelectForm({
  name = '',
  options = [],
  hideComment,
  commentPlaceholder,
}: {
  name: string;
  hideComment?: boolean;
  commentPlaceholder?: string;
  options: { value: string; label: string }[];
}) {
  const _name = `${name}Rating`;
  const { control, register } = useFormContext();
  const { field } = useController({ name: _name, control });

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
      {!hideComment && (
        <Textarea
          {...register(`${name}Comment`)}
          placeholder={
            commentPlaceholder ??
            'Please feel free to elaborate here. Reminder that these responses are anonymous...'
          }
        />
      )}
    </div>
  );
}
