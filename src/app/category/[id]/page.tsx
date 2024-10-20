import { CategoryDetails } from '@/components/category-details';
import { PageView } from '@/components/common/page-view';
import { categories } from '@/lib/categories';
import { CategoryId } from '@/types/various';

export default function CategoryDetailsPage({
  params: { id },
}: {
  params: { id: CategoryId };
}) {
  const category = categories.find((cat) => cat.id === id);
  console.log('category', category);

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <>
      <CategoryDetails {...category} id={id} />
      <PageView title={'category-details'} />
    </>
  );
}
