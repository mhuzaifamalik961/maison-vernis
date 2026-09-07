const PRODUCT_BATCH_SIZE = 12;

const EDITORIAL_CONTENT = [
    {
        layout: "editorial-image-left",
        theme: "editorial-dark",
        eyebrow: "THE MAISON EDIT",
        title: "A Study In Quiet Luxury",
        text: "Exceptional silhouettes, refined materials and considered details selected for the modern Maison.",
        label: "Luxury Pick",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
        imageAlt: "Luxury leather handbag editorial"
    },
    {
        layout: "editorial-image-right",
        theme: "editorial-light",
        eyebrow: "THE SIGNATURE SELECTION",
        title: "Details Worth Remembering",
        text: "A refined selection shaped by precision, restraint and the quiet confidence of timeless design.",
        label: "Featured Selection",
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85",
        imageAlt: "Luxury fashion editorial portrait"
    },
    {
        layout: "editorial-full-image",
        theme: "editorial-campaign",
        eyebrow: "CRAFTED TO ENDURE",
        title: "The Art Of Being Timeless",
        text: "Modern craftsmanship meets enduring elegance in a collection created to transcend the season.",
        label: "Maison Highlight",
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85",
        imageAlt: "Luxury fashion campaign"
    },
    {
        layout: "editorial-minimal",
        theme: "editorial-minimal-dark",
        eyebrow: "THE FINAL EDIT",
        title: "Luxury, Quietly Expressed",
        text: "The final selection from Maison Vernis, brought together through an uncompromising eye for elegance.",
        label: "Final Selection",
        image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
        imageAlt: "Elegant luxury fashion editorial"
    }
];

document.addEventListener("DOMContentLoaded", initializeMaisonVernis);

function initializeMaisonVernis() {
    renderProducts();
    initializeInteractions();
    updateBadges();
}

function renderProducts() {
    const showcase = document.getElementById("products-showcase");

    if (!showcase) {
        console.error("MAISON VERNIS: #products-showcase was not found.");
        return;
    }

    const products = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

    if (!products.length) {
        showcase.innerHTML = `
            <div class="products-empty-state">
                <p>No products found.</p>
            </div>
        `;
        return;
    }

    let markup = "";

    for (let start = 0; start < products.length; start += PRODUCT_BATCH_SIZE) {
        const batch = products.slice(start, start + PRODUCT_BATCH_SIZE);
        const batchNumber = Math.floor(start / PRODUCT_BATCH_SIZE) + 1;

        markup += `
            <section
                class="products-grid product-batch"
                data-batch="${batchNumber}"
                aria-label="Product selection ${batchNumber}"
            >
                ${batch
                    .map((product, index) =>
                        createProductCard(product, start + index)
                    )
                    .join("")}
            </section>
        `;

        const hasNextBatch = start + PRODUCT_BATCH_SIZE < products.length;

        if (hasNextBatch) {
            markup += createEditorialSection(batchNumber, products);
        }
    }

    showcase.innerHTML = markup;
}

function createProductCard(product, globalIndex = 0) {
    const productId = product?.id ?? "";
    const productName = product?.name ?? "Luxury Product";
    const productCategory = product?.category ?? "Luxury";
    const productImage = product?.image ?? "";
    const productPrice = Number(product?.price) || 0;

    const hasSale =
        product?.salePrice !== null &&
        product?.salePrice !== undefined &&
        Number(product.salePrice) > 0;

    const salePrice = Number(product.salePrice) || 0;

    const priceMarkup = hasSale
        ? `
            <span class="price-original">
                $${productPrice.toLocaleString()}
            </span>
            <span class="price-sale">
                $${salePrice.toLocaleString()}
            </span>
        `
        : `$${productPrice.toLocaleString()}`;

    const imageLoading =
        globalIndex < PRODUCT_BATCH_SIZE ? "eager" : "lazy";

    return `
        <article
            class="product-card"
            data-id="${escapeAttribute(productId)}"
        >
            <div class="product-media">
                <img
                    class="primary-img"
                    src="${escapeAttribute(productImage)}"
                    alt="${escapeAttribute(productName)}"
                    loading="${imageLoading}"
                >

                <button
                    class="quick-view-btn"
                    type="button"
                    data-action="quick-view"
                    data-id="${escapeAttribute(productId)}"
                >
                    Quick View
                </button>
            </div>

            <div class="product-info">
                <span class="product-category">
                    ${escapeHTML(productCategory)}
                </span>

                <h3 class="product-title">
                    ${escapeHTML(productName)}
                </h3>

                <p class="product-price">
                    ${priceMarkup}
                </p>

                <div class="product-actions">
                    <button
                        class="btn-add-cart"
                        type="button"
                        data-action="add-cart"
                        data-id="${escapeAttribute(productId)}"
                    >
                        Add to Bag
                    </button>

                    <button
                        class="btn-wishlist"
                        type="button"
                        data-action="add-wishlist"
                        data-id="${escapeAttribute(productId)}"
                        aria-label="Add ${escapeAttribute(productName)} to wishlist"
                    >
                        <i class="far fa-heart" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function createEditorialSection(batchNumber, products = []) {
    const contentIndex =
        (batchNumber - 1) % EDITORIAL_CONTENT.length;

    const content = EDITORIAL_CONTENT[contentIndex];

    const featuredProductIndex =
        batchNumber * PRODUCT_BATCH_SIZE;

    const featuredProduct =
        products[featuredProductIndex] || products[0];

    const featuredProductId =
        featuredProduct?.id ?? "";

    return `
        <section
            class="editorial-break ${content.layout} ${content.theme}"
            data-editorial="${batchNumber}"
            aria-label="${escapeAttribute(content.label)}"
        >
            <div
                class="editorial-background"
                aria-hidden="true"
            >
                <span class="editorial-ghost">MAISON</span>
            </div>

            <div class="editorial-inner">
                <div class="editorial-visual">
                    <div class="editorial-image-frame">
                        <span class="editorial-image-label">
                            ${escapeHTML(content.label)}
                        </span>

                        <img
                            class="editorial-product-image"
                            src="${escapeAttribute(content.image)}"
                            alt="${escapeAttribute(content.imageAlt)}"
                            loading="lazy"
                        >

                        <span
                            class="editorial-image-number"
                            aria-hidden="true"
                        >
                            ${String(batchNumber).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                <div class="editorial-content">
                    <span class="editorial-eyebrow">
                        ${escapeHTML(content.eyebrow)}
                    </span>

                    <div
                        class="editorial-line"
                        aria-hidden="true"
                    ></div>

                    <h2 class="editorial-title">
                        ${escapeHTML(content.title)}
                    </h2>

                    <p class="editorial-text">
                        ${escapeHTML(content.text)}
                    </p>

                    <div class="editorial-detail-row">
                        <span class="editorial-detail-label">
                            MAISON VERNIS
                        </span>

                        <span
                            class="editorial-divider"
                            aria-hidden="true"
                        >
                            /
                        </span>

                        <span class="editorial-detail-label">
                            ${String(batchNumber).padStart(2, "0")}
                        </span>
                    </div>

                    <button
                        type="button"
                        class="editorial-discover"
                        data-action="quick-view"
                        data-id="${escapeAttribute(featuredProductId)}"
                    >
                        <span>Discover Selection</span>
                        <i
                            class="fas fa-arrow-right"
                            aria-hidden="true"
                        ></i>
                    </button>

                    <span class="editorial-index">
                        EDIT ${String(batchNumber).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </section>
    `;
}

function initializeInteractions() {
    setupEventListeners();
    setupEditorialAnimation();
    setupSearch();
}

function setupEventListeners() {
    const showcase = document.getElementById("products-showcase");

    if (!showcase) {
        return;
    }

    showcase.addEventListener("click", handleShowcaseClick);

    setupModalEvents();
}

function handleShowcaseClick(event) {
    const actionElement = event.target.closest("[data-action]");

    if (!actionElement) {
        return;
    }

    const action = actionElement.dataset.action;
    const productId = actionElement.dataset.id;

    if (!productId) {
        return;
    }

    if (action === "add-cart") {
        addToCart(productId);
    }

    if (action === "add-wishlist") {
        toggleWishlist(productId);
    }

    if (action === "quick-view") {
        openQuickView(productId);
    }
}

function addToCart(productId) {
    const product = getProductById(productId);

    if (!product) {
        console.warn(`MAISON VERNIS: Product "${productId}" not found.`);
        return;
    }

    if (
        window.MaisonStore &&
        typeof window.MaisonStore.addItem === "function"
    ) {
        window.MaisonStore.addItem(productId);
        updateBadges();
        showToast("Item added to your shopping bag.");
    } else {
        console.warn(
            "MAISON VERNIS: MaisonStore.addItem() unavailable."
        );
    }
}

function toggleWishlist(productId) {
    const product = getProductById(productId);

    if (!product) {
        console.warn(`MAISON VERNIS: Product "${productId}" not found.`);
        return;
    }

    if (
        window.MaisonStore &&
        typeof window.MaisonStore.toggleWishlist === "function"
    ) {
        window.MaisonStore.toggleWishlist(productId);
        updateBadges();
        updateWishlistButton(productId);
        showToast("Wishlist updated.");
    } else {
        console.warn(
            "MAISON VERNIS: MaisonStore.toggleWishlist() unavailable."
        );
    }
}

function updateWishlistButton(productId) {
    const buttons = document.querySelectorAll(
        `.btn-wishlist[data-id="${CSS.escape(String(productId))}"]`
    );

    if (!window.MaisonStore) {
        return;
    }

    let isActive = false;

    if (
        typeof window.MaisonStore.isInWishlist === "function"
    ) {
        isActive =
            window.MaisonStore.isInWishlist(productId) === true;
    }

    buttons.forEach(button => {
        button.classList.toggle("active", isActive);

        const icon = button.querySelector("i");

        if (icon) {
            icon.classList.toggle("far", !isActive);
            icon.classList.toggle("fas", isActive);
        }
    });
}

function getProductById(productId) {
    const products =
        Array.isArray(window.PRODUCTS)
            ? window.PRODUCTS
            : [];

    return products.find(
        product => String(product?.id) === String(productId)
    );
}

function updateBadges() {
    const cartBadge =
        document.getElementById("cart-count");

    const wishlistBadge =
        document.getElementById("wishlist-count");

    if (!window.MaisonStore) {
        return;
    }

    if (cartBadge) {
        const cartCount =
            typeof window.MaisonStore.getCartCount === "function"
                ? window.MaisonStore.getCartCount()
                : 0;

        cartBadge.textContent = String(cartCount);
    }

    if (wishlistBadge) {
        const wishlistCount =
            typeof window.MaisonStore.getWishlistCount === "function"
                ? window.MaisonStore.getWishlistCount()
                : 0;

        wishlistBadge.textContent = String(wishlistCount);
    }

    if (Array.isArray(window.PRODUCTS)) {
        window.PRODUCTS.forEach(product => {
            if (product?.id !== undefined) {
                updateWishlistButton(product.id);
            }
        });
    }
}

function openQuickView(productId) {
    const modal =
        document.getElementById("quick-view-modal");

    const modalContent =
        document.getElementById("modal-content-target");

    const product =
        getProductById(productId);

    if (!modal || !modalContent || !product) {
        console.warn(
            "MAISON VERNIS: Quick View could not be opened."
        );
        return;
    }

    const productName =
        product.name || "Luxury Product";

    const productCategory =
        product.category || "Luxury";

    const productImage =
        product.image || "";

    const productDescription =
        product.description ||
        "Crafted with premium materials and refined Maison Vernis design standards.";

    const productPrice =
        Number(product.price) || 0;

    const hasSale =
        product.salePrice !== null &&
        product.salePrice !== undefined &&
        Number(product.salePrice) > 0;

    const salePrice =
        Number(product.salePrice) || 0;

    const priceMarkup = hasSale
        ? `
            <span class="price-original">
                $${productPrice.toLocaleString()}
            </span>

            <span class="price-sale">
                $${salePrice.toLocaleString()}
            </span>
        `
        : `$${productPrice.toLocaleString()}`;

    const sizeMarkup =
        Array.isArray(product.sizes) &&
        product.sizes.length
            ? `
                <div class="qv-option-group">
                    <label>Size</label>

                    <div class="qv-sizes">
                        ${product.sizes
                            .map(
                                size => `
                                    <button
                                        type="button"
                                        class="qv-size-btn"
                                        data-qv-size="${escapeAttribute(size)}"
                                    >
                                        ${escapeHTML(size)}
                                    </button>
                                `
                            )
                            .join("")}
                    </div>
                </div>
            `
            : "";

    const colorMarkup =
        Array.isArray(product.colors) &&
        product.colors.length
            ? `
                <div class="qv-option-group">
                    <label>Color</label>

                    <div class="qv-colors">
                        ${product.colors
                            .map(
                                color => `
                                    <button
                                        type="button"
                                        class="qv-color-btn"
                                        data-qv-color="${escapeAttribute(color)}"
                                    >
                                        ${escapeHTML(color)}
                                    </button>
                                `
                            )
                            .join("")}
                    </div>
                </div>
            `
            : "";

    modalContent.innerHTML = `
        <div class="modal-product-detail">
            <div class="qv-image-wrap">
                <img
                    src="${escapeAttribute(productImage)}"
                    alt="${escapeAttribute(productName)}"
                    loading="eager"
                >
            </div>

            <div class="qv-content">
                <span class="qv-category">
                    ${escapeHTML(productCategory)}
                </span>

                <h2 class="qv-title">
                    ${escapeHTML(productName)}
                </h2>

                <p class="qv-price">
                    ${priceMarkup}
                </p>

                <p class="qv-desc">
                    ${escapeHTML(productDescription)}
                </p>

                ${sizeMarkup}

                ${colorMarkup}

                <div class="qv-actions">
                    <button
                        type="button"
                        class="btn-primary"
                        data-qv-action="add-cart"
                        data-id="${escapeAttribute(product.id)}"
                    >
                        Add to Bag
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add("active");
    document.body.classList.add("modal-open");

    setupQuickViewControls();
}

function setupQuickViewControls() {
    const modal =
        document.getElementById("quick-view-modal");

    if (!modal) {
        return;
    }

    const addButton =
        modal.querySelector(
            '[data-qv-action="add-cart"]'
        );

    if (addButton) {
        addButton.onclick = () => {
            addToCart(addButton.dataset.id);
            closeQuickView();
        };
    }

    const sizeButtons =
        modal.querySelectorAll("[data-qv-size]");

    sizeButtons.forEach(button => {
        button.onclick = () => {
            sizeButtons.forEach(item =>
                item.classList.remove("active")
            );

            button.classList.add("active");
        };
    });

    const colorButtons =
        modal.querySelectorAll("[data-qv-color]");

    colorButtons.forEach(button => {
        button.onclick = () => {
            colorButtons.forEach(item =>
                item.classList.remove("active")
            );

            button.classList.add("active");
        };
    });
}

function setupModalEvents() {
    const modal =
        document.getElementById("quick-view-modal");

    const closeButton =
        document.getElementById("modal-close-btn");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeQuickView
        );
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeQuickView();
            }
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeQuickView();
        }
    });
}

function closeQuickView() {
    const modal =
        document.getElementById("quick-view-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

function showToast(message) {
    const toast =
        document.getElementById("toast-notification");

    if (!toast) {
        return;
    }

    if (showToast.timeout) {
        clearTimeout(showToast.timeout);
    }

    toast.textContent = message;
    toast.classList.add("visible");

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);
}

showToast.timeout = null;

function setupEditorialAnimation() {
    const sections =
        document.querySelectorAll(".editorial-break");

    if (!sections.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        sections.forEach(section => {
            section.classList.add("is-visible");
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observerInstance.unobserve(
                        entry.target
                    );
                });
            },
            {
                threshold: 0.18
            }
        );

    sections.forEach(section => {
        observer.observe(section);
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

window.MaisonVernis = {
    refresh() {
        updateBadges();
    },

    updateBadges,

    getProductById,

    openQuickView,

    closeQuickView
};

/* =========================================================
   SEARCH SYSTEM
========================================================= */

function setupSearch() {

    const searchOverlay =
        document.getElementById("search-overlay");

    const searchInput =
        document.getElementById("search-input");

    const searchClose =
        document.getElementById("search-close-btn");

    const searchClear =
        document.getElementById("search-clear-btn");

    const searchProducts =
        document.getElementById("search-products");

    if (
        !searchOverlay ||
        !searchInput ||
        !searchClose ||
        !searchProducts
    ) {
        return;
    }

    renderSearchProducts(getFeaturedSearchProducts());

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        if (!query) {

            renderSearchProducts(
                getFeaturedSearchProducts()
            );

            return;
        }

        const products =
            Array.isArray(window.PRODUCTS)
                ? window.PRODUCTS
                : [];

        const results =
            products.filter(product => {

                const searchableText = [
                    product.name,
                    product.category,
                    product.description
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(query);
            });

        renderSearchProducts(results);
    });


    searchClear?.addEventListener("click", () => {

        searchInput.value = "";

        renderSearchProducts(
            getFeaturedSearchProducts()
        );

        searchInput.focus();
    });


    searchClose.addEventListener(
        "click",
        closeSearch
    );


    searchOverlay.addEventListener(
        "click",
        event => {

            if (event.target === searchOverlay) {
                closeSearch();
            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeSearch();
            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            const searchTrigger =
                event.target.closest(
                    '[data-action="open-search"]'
                );

            if (!searchTrigger) {
                return;
            }

            event.preventDefault();

            openSearch();
        }
    );


    searchProducts.addEventListener(
        "click",
        event => {

            const productCard =
                event.target.closest(
                    "[data-search-product]"
                );

            if (!productCard) {
                return;
            }

            const productId =
                productCard.dataset.searchProduct;

            if (!productId) {
                return;
            }

            closeSearch();

            openQuickView(productId);
        }
    );
}


/* =========================================================
   OPEN SEARCH
========================================================= */

function openSearch() {

    const overlay =
        document.getElementById("search-overlay");

    const input =
        document.getElementById("search-input");

    if (!overlay) {
        return;
    }

    overlay.classList.add("active");

    document.body.classList.add("search-open");

    requestAnimationFrame(() => {

        input?.focus();

    });
}


/* =========================================================
   CLOSE SEARCH
========================================================= */

function closeSearch() {

    const overlay =
        document.getElementById("search-overlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("active");

    document.body.classList.remove("search-open");
}


/* =========================================================
   INITIAL SEARCH PRODUCTS
========================================================= */

function getFeaturedSearchProducts() {

    const products =
        Array.isArray(window.PRODUCTS)
            ? window.PRODUCTS
            : [];

    /*
     * Show selected products before
     * the customer starts typing.
     */

    return products.slice(0, 6);
}


/* =========================================================
   RENDER SEARCH PRODUCTS
========================================================= */

function renderSearchProducts(products) {

    const container =
        document.getElementById("search-products");

    const emptyState =
        document.getElementById("search-empty");

    const title =
        document.getElementById(
            "search-results-title"
        );

    const count =
        document.getElementById(
            "search-results-count"
        );

    if (!container) {
        return;
    }


    const input =
        document.getElementById("search-input");

    const query =
        input?.value.trim() || "";


    if (title) {

        title.textContent =
            query
                ? "Search Results"
                : "Curated Selection";

    }


    if (count) {

        count.textContent =
            `${products.length} ${
                products.length === 1
                    ? "item"
                    : "items"
            }`;

    }


    if (!products.length) {

        container.innerHTML = "";

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    if (emptyState) {
        emptyState.hidden = true;
    }


    container.innerHTML =
        products
            .map(product =>
                createSearchProductCard(product)
            )
            .join("");
}


/* =========================================================
   SEARCH PRODUCT CARD
========================================================= */

function createSearchProductCard(product) {

    const id =
        product?.id ?? "";

    const name =
        product?.name ?? "Luxury Product";

    const category =
        product?.category ?? "Luxury";

    const image =
        product?.image ?? "";

    const price =
        Number(product?.salePrice) > 0
            ? Number(product.salePrice)
            : Number(product?.price) || 0;


    return `
        <article
            class="mv-search-card"
            data-search-product="${escapeAttribute(id)}"
        >

            <div class="mv-search-card-image">

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(name)}"
                    loading="lazy"
                >

            </div>

            <div class="mv-search-card-info">

                <span>
                    ${escapeHTML(category)}
                </span>

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    $${price.toLocaleString()}
                </p>

            </div>

        </article>
    `;
}