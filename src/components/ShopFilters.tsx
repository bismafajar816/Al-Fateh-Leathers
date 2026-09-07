import { GENDERS, GENDER_LABELS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

interface ShopFiltersProps {
  /** Form action — the current page's path (without query string). */
  action: string;
  /** Pass the department name when it's fixed by the route (hides the department dropdown). */
  gender?: string;
  /** Pass the category name when it's fixed by the route (hides the category dropdown). */
  category?: string;
  /** Current value of the department filter, when the dropdown is shown. */
  selectedGender?: string;
  /** Current value of the category filter, when the dropdown is shown. */
  selectedCategory?: string;
  query: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export default function ShopFilters({
  action,
  gender,
  category,
  selectedGender = "",
  selectedCategory = "",
  query,
  minPrice,
  maxPrice,
  sort
}: ShopFiltersProps) {
  return (
    <form
      method="GET"
      action={action}
      className="mb-8 flex flex-wrap items-end gap-3 rounded-md border border-leather-100 bg-white p-4"
    >
      <div className="min-w-[160px] flex-1">
        <label className="label">Search</label>
        <input type="text" name="q" defaultValue={query} placeholder="Search products…" className="input" />
      </div>

      {!gender && (
        <div>
          <label className="label">Department</label>
          <select name="gender" defaultValue={selectedGender} className="input">
            <option value="">All</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
      )}

      {!category && (
        <div>
          <label className="label">Category</label>
          <select name="category" defaultValue={selectedCategory} className="input">
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="w-24">
        <label className="label">Min €</label>
        <input type="number" name="min" min="0" defaultValue={minPrice} className="input" />
      </div>
      <div className="w-24">
        <label className="label">Max €</label>
        <input type="number" name="max" min="0" defaultValue={maxPrice} className="input" />
      </div>

      <div>
        <label className="label">Sort</label>
        <select name="sort" defaultValue={sort} className="input">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <button type="submit" className="btn-primary h-10">
        Apply
      </button>
    </form>
  );
}