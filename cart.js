/**
 * ============================================================
 * MAISON VERNIS — CART & STORE ENGINE
 * ============================================================
 *
 * Handles:
 * - Shopping Bag / Cart
 * - LocalStorage persistence
 * - Quantity controls
 * - Remove / Clear cart
 * - Cart totals & shipping
 * - Header cart badge
 * - Wishlist
 * - Quick View
 * - Toast notifications
 *
 * Requires:
 * - products.js loaded before this file
 * - Font Awesome (for icons)
 * - Formatters.currency() if available
 * ============================================================
 */

class StoreEngine {

  constructor() {

    /* ---------------------------------------------
       STORAGE KEYS
    --------------------------------------------- */
    this.cartKey = "mv_cart_items_v1";
    this.wishlistKey = "mv_wishlist_items_v1";

    /* ---------------------------------------------
       STATE
    --------------------------------------------- */
    this.cart = this.load(this.cartKey) || [];
    this.wishlist = this.load(this.wishlistKey) || [];

    /* ---------------------------------------------
       INITIALIZATION
    --------------------------------------------- */
    this.initListeners();
    this.initCartDrawer();

    this.updateBadges();
    this.renderCartDrawer();
    this.updateWishlistButtons();

  }


  /* ==========================================================
     STORAGE
  ========================================================== */

  load(key) {

    try {

      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);

    } catch (error) {

      console.error(
        `[Maison Vernis] Could not read ${key}`,
        error
      );

      return null;
    }

  }


  save(key, data) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(data)
      );

    } catch (error) {

      console.error(
        `[Maison Vernis] Could not save ${key}`,
        error
      );

    }

  }


  /* ==========================================================
     PRODUCT HELPER
  ========================================================== */

  getProduct(productId) {

    if (typeof PRODUCTS === "undefined") {
      console.error(
        "[Maison Vernis] PRODUCTS is not available."
      );

      return null;
    }

    return PRODUCTS.find(
      product => String(product.id) === String(productId)
    ) || null;

  }


  /* ==========================================================
     PRICE FORMATTER
  ========================================================== */

  formatPrice(value) {

    const price = Number(value) || 0;

    if (
      typeof Formatters !== "undefined" &&
      typeof Formatters.currency === "function"
    ) {
      return Formatters.currency(price);
    }

    return `Rs. ${price.toLocaleString("en-PK")}`;

  }


  /* ==========================================================
     CART
  ========================================================== */

  addToCart(
    productId,
    selectedSize = null,
    selectedColor = null,
    quantity = 1
  ) {

    const product = this.getProduct(productId);

    if (!product) {
      console.warn(
        "[Maison Vernis] Product not found:",
        productId
      );
      return;
    }

    const size =
      selectedSize ||
      (product.sizes && product.sizes.length
        ? product.sizes[0]
        : "Standard");

    const color =
      selectedColor ||
      (product.colors && product.colors.length
        ? product.colors[0]
        : "Default");

    const qty = Math.max(
      1,
      parseInt(quantity, 10) || 1
    );


    /* ---------------------------------------------
       CHECK EXISTING VARIANT
    --------------------------------------------- */

    const existingIndex = this.cart.findIndex(item =>
      String(item.id) === String(productId) &&
      item.size === size &&
      item.color === color
    );


    /* ---------------------------------------------
       UPDATE EXISTING ITEM
    --------------------------------------------- */

    if (existingIndex !== -1) {

      this.cart[existingIndex].quantity += qty;

    }

    /* ---------------------------------------------
       ADD NEW ITEM
    --------------------------------------------- */

    else {

      this.cart.push({

        id: product.id,

        size: size,

        color: color,

        quantity: qty,

        unitPrice:
          Number(product.salePrice || product.price) || 0

      });

    }


    /* ---------------------------------------------
       SAVE + UI
    --------------------------------------------- */

    this.save(
      this.cartKey,
      this.cart
    );

    this.updateBadges();
    this.renderCartDrawer();

    this.showToast(
      `"${product.name}" added to your bag.`
    );


    /* ---------------------------------------------
       OPTIONAL CART OPEN
       Makes Add to Bag feel more premium.
    --------------------------------------------- */

    setTimeout(() => {
      this.openCartDrawer();
    }, 180);

  }


  removeFromCart(index) {

    const item = this.cart[index];

    if (!item) return;

    const product = this.getProduct(item.id);

    this.cart.splice(index, 1);

    this.save(
      this.cartKey,
      this.cart
    );

    this.updateBadges();
    this.renderCartDrawer();

    this.showToast(
      product
        ? `"${product.name}" removed from your bag.`
        : "Item removed from your bag."
    );

  }


  updateQuantity(index, newQuantity) {

    if (!this.cart[index]) return;

    const quantity =
      parseInt(newQuantity, 10) || 0;

    if (quantity <= 0) {

      this.removeFromCart(index);
      return;

    }

    this.cart[index].quantity = quantity;

    this.save(
      this.cartKey,
      this.cart
    );

    this.updateBadges();
    this.renderCartDrawer();

  }


  clearCart() {

    if (!this.cart.length) {
      return;
    }

    this.cart = [];

    this.save(
      this.cartKey,
      this.cart
    );

    this.updateBadges();
    this.renderCartDrawer();

    this.showToast(
      "Your shopping bag has been cleared."
    );

  }


  /* ==========================================================
     CART TOTALS
  ========================================================== */

  getCartTotals() {

    const subtotal = this.cart.reduce(
      (total, item) => {

        return total +
          (
            Number(item.unitPrice) *
            Number(item.quantity)
          );

      },
      0
    );


    /*
      MAISON VERNIS SHIPPING POLICY

      Free shipping:
      - Orders above Rs. 2,000
      - Empty cart

      Otherwise:
      - Rs. 75
    */

    const shipping =
      subtotal === 0 || subtotal > 2000
        ? 0
        : 75;

    const total =
      subtotal + shipping;

    const totalCount =
      this.cart.reduce(
        (count, item) =>
          count + Number(item.quantity || 0),
        0
      );

    return {
      subtotal,
      shipping,
      total,
      totalCount
    };

  }


  /* ==========================================================
     CART BADGE
  ========================================================== */

  updateBadges() {

    const totals =
      this.getCartTotals();


    /* Cart */

    document
      .querySelectorAll(".cart-count-badge")
      .forEach(badge => {

        badge.textContent =
          totals.totalCount;

        badge.style.display =
          totals.totalCount > 0
            ? "inline-flex"
            : "none";

      });


    /* Wishlist */

    document
      .querySelectorAll(".wishlist-count-badge")
      .forEach(badge => {

        badge.textContent =
          this.wishlist.length;

        badge.style.display =
          this.wishlist.length > 0
            ? "inline-flex"
            : "none";

      });

  }


  /* ==========================================================
     CART DRAWER
  ========================================================== */

  initCartDrawer() {

    const drawer =
      document.getElementById("cart-drawer");

    const overlay =
      document.getElementById("cart-overlay");

    const closeButton =
      document.getElementById("cart-close");

    const cartIcon =
      document.querySelector(
        '.site-header .action-icon[aria-label="Shopping Bag"]'
      );


    /* ---------------------------------------------
       CART ICON
    --------------------------------------------- */

    if (cartIcon) {

      cartIcon.addEventListener(
        "click",
        event => {

          event.preventDefault();

          this.openCartDrawer();

        }
      );

    }


    /* ---------------------------------------------
       CLOSE BUTTON
    --------------------------------------------- */

    if (closeButton) {

      closeButton.addEventListener(
        "click",
        () => {
          this.closeCartDrawer();
        }
      );

    }


    /* ---------------------------------------------
       OVERLAY
    --------------------------------------------- */

    if (overlay) {

      overlay.addEventListener(
        "click",
        () => {
          this.closeCartDrawer();
        }
      );

    }


    /* ---------------------------------------------
       ESCAPE KEY
    --------------------------------------------- */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          drawer &&
          drawer.classList.contains("active")
        ) {

          this.closeCartDrawer();

        }

      }
    );

  }


  openCartDrawer() {

    const drawer =
      document.getElementById("cart-drawer");

    const overlay =
      document.getElementById("cart-overlay");

    if (!drawer) return;

    this.renderCartDrawer();

    drawer.classList.add("active");

    if (overlay) {
      overlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";

  }


  closeCartDrawer() {

    const drawer =
      document.getElementById("cart-drawer");

    const overlay =
      document.getElementById("cart-overlay");

    if (drawer) {
      drawer.classList.remove("active");
    }

    if (overlay) {
      overlay.classList.remove("active");
    }

    document.body.style.overflow = "";

  }


  /* ==========================================================
     RENDER CART
  ========================================================== */

  renderCartDrawer() {

    const body =
      document.getElementById("cart-drawer-body");

    const footer =
      document.getElementById("cart-drawer-footer");

    if (!body || !footer) {
      return;
    }


    /* ---------------------------------------------
       EMPTY CART
    --------------------------------------------- */

    if (!this.cart.length) {

      body.innerHTML = `

        <div class="cart-empty">

          <div class="cart-empty-icon">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>

          <h3>Your bag is empty</h3>

          <p>
            Discover something beautiful
            from our collection.
          </p>

        </div>

      `;

      footer.innerHTML = "";

      return;

    }


    /* ---------------------------------------------
       CART ITEMS
    --------------------------------------------- */

    body.innerHTML = this.cart
      .map((item, index) => {

        const product =
          this.getProduct(item.id);

        if (!product) {
          return "";
        }


        const lineTotal =
          Number(item.unitPrice) *
          Number(item.quantity);


        return `

          <article
            class="cart-item"
            data-cart-index="${index}"
          >

            <img
              class="cart-item-image"
              src="${product.image}"
              alt="${product.name}"
              loading="lazy"
            >

            <div class="cart-item-info">

              <span class="cart-item-category">
                ${product.category || "Collection"}
              </span>

              <h3 class="cart-item-name">
                ${product.name}
              </h3>

              <div class="cart-item-meta">

                ${
                  item.size
                    ? `Size: ${item.size}`
                    : ""
                }

                ${
                  item.color
                    ? ` &nbsp;|&nbsp; Color: ${item.color}`
                    : ""
                }

              </div>

              <div class="cart-item-price">

                ${this.formatPrice(lineTotal)}

              </div>

              <div class="cart-item-bottom">

                <div class="cart-quantity">

                  <button
                    type="button"
                    class="cart-quantity-btn"
                    data-cart-action="decrease"
                    data-index="${index}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span class="cart-quantity-value">
                    ${item.quantity}
                  </span>

                  <button
                    type="button"
                    class="cart-quantity-btn"
                    data-cart-action="increase"
                    data-index="${index}"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

                <button
                  type="button"
                  class="cart-remove"
                  data-cart-action="remove"
                  data-index="${index}"
                >
                  Remove
                </button>

              </div>

            </div>

          </article>

        `;

      })
      .join("");


    /* ---------------------------------------------
       FOOTER
    --------------------------------------------- */

    const totals =
      this.getCartTotals();


    footer.innerHTML = `

      <div class="cart-summary-row">

        <span>Subtotal</span>

        <span>
          ${this.formatPrice(totals.subtotal)}
        </span>

      </div>


      <div class="cart-summary-row">

        <span>Shipping</span>

        <span>

          ${
            totals.shipping === 0
              ? "Complimentary"
              : this.formatPrice(totals.shipping)
          }

        </span>

      </div>


      <div class="cart-summary-row total">

        <span>Total</span>

        <span>
          ${this.formatPrice(totals.total)}
        </span>

      </div>


      <button
        type="button"
        class="cart-checkout-btn"
        id="cart-checkout-btn"
      >
        PROCEED TO CHECKOUT
      </button>


      <p class="cart-shipping-note">

        Complimentary shipping
        on orders over Rs. 2,000

      </p>

    `;


    this.bindCartActions();

  }


  /* ==========================================================
     CART BUTTON EVENTS
  ========================================================== */

  bindCartActions() {

    const body =
      document.getElementById("cart-drawer-body");

    if (!body) return;


    body
      .querySelectorAll("[data-cart-action]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.cartAction;

            const index =
              Number(button.dataset.index);

            if (
              !Number.isInteger(index) ||
              !this.cart[index]
            ) {
              return;
            }


            /* Increase */

            if (action === "increase") {

              this.updateQuantity(
                index,
                this.cart[index].quantity + 1
              );

            }


            /* Decrease */

            else if (action === "decrease") {

              this.updateQuantity(
                index,
                this.cart[index].quantity - 1
              );

            }


            /* Remove */

            else if (action === "remove") {

              this.removeFromCart(index);

            }

          }
        );

      });


    /* ---------------------------------------------
       CHECKOUT
    --------------------------------------------- */

    const checkoutButton =
      document.getElementById(
        "cart-checkout-btn"
      );

    if (checkoutButton) {

      checkoutButton.addEventListener(
        "click",
        () => {

          if (!this.cart.length) {
            return;
          }

          /*
            Replace this later with:
            window.location.href = "checkout.html";
          */

          this.showToast(
            "Checkout is coming soon."
          );

        }
      );

    }

  }


  /* ==========================================================
     WISHLIST
  ========================================================== */

  toggleWishlist(productId) {

    const product =
      this.getProduct(productId);

    const index =
      this.wishlist.findIndex(
        id => String(id) === String(productId)
      );


    if (index !== -1) {

      this.wishlist.splice(index, 1);

      this.showToast(
        "Removed from your wishlist."
      );

    }

    else {

      this.wishlist.push(productId);

      this.showToast(
        product
          ? `"${product.name}" saved to wishlist.`
          : "Item saved to wishlist."
      );

    }


    this.save(
      this.wishlistKey,
      this.wishlist
    );

    this.updateBadges();

    this.updateWishlistButtons();

    this.triggerWishlistRender();

  }


  isInWishlist(productId) {

    return this.wishlist.some(
      id => String(id) === String(productId)
    );

  }


  updateWishlistButtons(productId = null) {

    const selector =
      productId
        ? `.btn-wishlist[data-id="${productId}"]`
        : ".btn-wishlist";

    document
      .querySelectorAll(selector)
      .forEach(button => {

        const id =
          button.getAttribute("data-id");

        const saved =
          this.isInWishlist(id);

        button.classList.toggle(
          "active",
          saved
        );

        button.setAttribute(
          "aria-label",
          saved
            ? "Remove from wishlist"
            : "Add to wishlist"
        );

      });

  }


  /* ==========================================================
     TOAST
  ========================================================== */

  showToast(message) {

    let toast =
      document.getElementById(
        "mv-toast-notification"
      );


    if (!toast) {

      toast =
        document.createElement("div");

      toast.id =
        "mv-toast-notification";

      toast.className =
        "mv-toast";

      document.body.appendChild(toast);

    }


    toast.textContent = message;

    toast.classList.remove("visible");


    /*
      Force browser reflow so repeated
      notifications animate correctly.
    */

    void toast.offsetWidth;


    toast.classList.add("visible");


    clearTimeout(
      this.toastTimer
    );


    this.toastTimer =
      setTimeout(() => {

        toast.classList.remove(
          "visible"
        );

      }, 3000);

  }


  /* ==========================================================
     QUICK VIEW
  ========================================================== */

  openQuickView(productId) {

    const product =
      this.getProduct(productId);

    if (!product) return;


    let modal =
      document.getElementById(
        "mv-quickview-modal"
      );


    if (!modal) {

      modal =
        document.createElement("div");

      modal.id =
        "mv-quickview-modal";

      modal.className =
        "mv-modal-backdrop";

      document.body.appendChild(modal);

    }


    /* ---------------------------------------------
       PRICE
    --------------------------------------------- */

    const priceHTML =
      product.salePrice

        ? `
          <span class="price-original">
            ${this.formatPrice(product.price)}
          </span>

          <span class="price-sale">
            ${this.formatPrice(product.salePrice)}
          </span>
        `

        : `
          <span>
            ${this.formatPrice(product.price)}
          </span>
        `;


    /* ---------------------------------------------
       SIZE OPTIONS
    --------------------------------------------- */

    const sizeOptions =
      product.sizes && product.sizes.length

        ? product.sizes
            .map(
              (size, index) => `

                <button
                  type="button"
                  class="qv-size-btn ${
                    index === 0
                      ? "active"
                      : ""
                  }"
                  data-size="${size}"
                >
                  ${size}
                </button>

              `
            )
            .join("")

        : "";


    /* ---------------------------------------------
       COLOR OPTIONS
    --------------------------------------------- */

    const colorOptions =
      product.colors && product.colors.length

        ? product.colors
            .map(
              (color, index) => `

                <button
                  type="button"
                  class="qv-color-btn ${
                    index === 0
                      ? "active"
                      : ""
                  }"
                  data-color="${color}"
                >
                  ${color}
                </button>

              `
            )
            .join("")

        : "";


    /* ---------------------------------------------
       MODAL HTML
    --------------------------------------------- */

    modal.innerHTML = `

      <div class="mv-modal-dialog">

        <button
          class="mv-modal-close"
          id="qv-close-btn"
          aria-label="Close"
          type="button"
        >
          &times;
        </button>


        <div class="mv-modal-grid">


          <div class="mv-modal-media">

            <img
              src="${product.image}"
              alt="${product.name}"
              id="qv-main-img"
            >

          </div>


          <div class="mv-modal-details">

            <span class="qv-category">

              ${product.gender
                ? product.gender.toUpperCase()
                : ""}

              ${product.category
                ? ` / ${product.category.toUpperCase()}`
                : ""}

            </span>


            <h2 class="qv-title">
              ${product.name}
            </h2>


            <div class="qv-price">
              ${priceHTML}
            </div>


            <p class="qv-desc">
              ${product.description || ""}
            </p>


            ${
              product.sizes &&
              product.sizes.length

                ? `

                  <div class="qv-option-group">

                    <label>Size:</label>

                    <div class="qv-sizes">
                      ${sizeOptions}
                    </div>

                  </div>

                `

                : ""
            }


            ${
              product.colors &&
              product.colors.length

                ? `

                  <div class="qv-option-group">

                    <label>Color:</label>

                    <div class="qv-colors">
                      ${colorOptions}
                    </div>

                  </div>

                `

                : ""
            }


            <div class="qv-actions">

              <button
                class="btn-primary"
                id="qv-add-cart-btn"
                type="button"
              >
                ADD TO BAG
              </button>


              <a
                href="product.html?id=${product.id}"
                class="btn-secondary"
              >
                VIEW FULL DETAILS
              </a>

            </div>

          </div>

        </div>

      </div>

    `;


    /* ---------------------------------------------
       OPEN MODAL
    --------------------------------------------- */

    modal.classList.add("active");

    document.body.style.overflow =
      "hidden";


    /* ---------------------------------------------
       CLOSE
    --------------------------------------------- */

    const closeModal = () => {

      modal.classList.remove(
        "active"
      );

      document.body.style.overflow =
        "";

    };


    const closeButton =
      modal.querySelector(
        "#qv-close-btn"
      );

    if (closeButton) {

      closeButton.onclick =
        closeModal;

    }


    modal.onclick =
      event => {

        if (
          event.target === modal
        ) {
          closeModal();
        }

      };


    /* ---------------------------------------------
       SIZE SELECTION
    --------------------------------------------- */

    const sizeButtons =
      modal.querySelectorAll(
        ".qv-size-btn"
      );

    sizeButtons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          sizeButtons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

        }
      );

    });


    /* ---------------------------------------------
       COLOR SELECTION
    --------------------------------------------- */

    const colorButtons =
      modal.querySelectorAll(
        ".qv-color-btn"
      );

    colorButtons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          colorButtons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

        }
      );

    });


    /* ---------------------------------------------
       ADD TO BAG
    --------------------------------------------- */

    const addButton =
      modal.querySelector(
        "#qv-add-cart-btn"
      );

    if (addButton) {

      addButton.addEventListener(
        "click",
        () => {

          const activeSize =
            modal.querySelector(
              ".qv-size-btn.active"
            )?.dataset.size || null;


          const activeColor =
            modal.querySelector(
              ".qv-color-btn.active"
            )?.dataset.color || null;


          this.addToCart(
            product.id,
            activeSize,
            activeColor,
            1
          );


          closeModal();

        }
      );

    }

  }


  /* ==========================================================
     GLOBAL EVENT LISTENERS
  ========================================================== */

  initListeners() {

    document.addEventListener(
      "click",
      event => {


        /* -----------------------------------------
           ADD TO CART
        ----------------------------------------- */

        const addButton =
          event.target.closest(
            ".btn-add-cart"
          );


        if (addButton) {

          event.preventDefault();

          const id =
            addButton.getAttribute(
              "data-id"
            );

          if (id) {

            this.addToCart(id);

          }

          return;

        }


        /* -----------------------------------------
           WISHLIST
        ----------------------------------------- */

        const wishlistButton =
          event.target.closest(
            ".btn-wishlist"
          );


        if (wishlistButton) {

          event.preventDefault();

          const id =
            wishlistButton.getAttribute(
              "data-id"
            );

          if (id) {

            this.toggleWishlist(id);

          }

          return;

        }


        /* -----------------------------------------
           QUICK VIEW
        ----------------------------------------- */

        const quickViewButton =
          event.target.closest(
            ".btn-quick-view"
          );


        if (quickViewButton) {

          event.preventDefault();

          const id =
            quickViewButton.getAttribute(
              "data-id"
            );

          if (id) {

            this.openQuickView(id);

          }

        }

      }
    );

  }


  /* ==========================================================
     EXTERNAL RENDER HOOKS
  ========================================================== */

  triggerCartRender() {

    if (
      typeof renderCartPage ===
      "function"
    ) {

      renderCartPage();

    }

    this.renderCartDrawer();

  }


  triggerWishlistRender() {

    if (
      typeof renderWishlistPage ===
      "function"
    ) {

      renderWishlistPage();

    }

  }

}


/* ============================================================
   GLOBAL INSTANCE
============================================================ */

window.MaisonStore =
  new StoreEngine();


console.log(
  "MAISON VERNIS — Store Engine initialized."
);