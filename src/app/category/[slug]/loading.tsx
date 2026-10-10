export default function CategoryLoading() {
  return (
    <main aria-busy="true" aria-label="বিভাগের পণ্য লোড হচ্ছে" className="category-page">
      <div className="category-page-heading category-skeleton-heading">
        <span className="skeleton-block category-skeleton-icon" />
        <div className="category-skeleton-copy">
          <span className="skeleton-block category-skeleton-title" />
          <span className="skeleton-block category-skeleton-subtitle" />
        </div>
      </div>
      <div className="category-sort-bar category-skeleton-sort">
        <span className="skeleton-block category-skeleton-select" />
      </div>
      <p className="category-loading-label" role="status">
        পণ্য লোড হচ্ছে…
      </p>
      <div className="product-grid category-product-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="category-product-skeleton" key={index}>
            <div className="category-skeleton-product-heading">
              <span className="skeleton-block category-skeleton-thumb" />
              <span className="skeleton-block category-skeleton-name" />
            </div>
            <span className="skeleton-block category-skeleton-price" />
          </div>
        ))}
      </div>
    </main>
  );
}
