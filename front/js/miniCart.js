/**
 * MINI CART & PERFORMANCE MANAGER
 * Gestion du mini-panier, compteur temps réel et loading states
 */

class MiniCartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cartLs')) || [];
    this.miniCart = document.getElementById('miniCart');
    this.cartCounter = document.getElementById('cartCounter');
    this.miniCartItems = document.getElementById('miniCartItems');
    this.miniCartTotal = document.getElementById('miniCartTotal');
    this.miniCartClose = document.getElementById('miniCartClose');

    console.log('MiniCartManager initialized'); // Debug
    console.log('Mini cart element:', this.miniCart); // Debug
    console.log('Cart counter:', this.cartCounter); // Debug
    console.log('Close button:', this.miniCartClose); // Debug

    this.init();
  }

  init() {
    this.updateCounter();
    this.updateMiniCart();
    this.bindEvents();
  }

  bindEvents() {
    const cartLink = document.querySelector('.cart-link');

    // Version simplifiée pour debug
    if (cartLink) {
      cartLink.addEventListener('click', (e) => {
        console.log('Cart link clicked!'); // Debug
        e.preventDefault();
        this.toggleMiniCart();
      });
    }

    // Fermer le mini-cart avec le bouton close
    if (this.miniCartClose) {
      this.miniCartClose.addEventListener('click', () => {
        console.log('Close button clicked!'); // Debug
        this.hideMiniCart();
      });
    }

    // Fermer en cliquant sur l'overlay
    if (this.miniCart) {
      this.miniCart.addEventListener('click', (e) => {
        if (e.target === this.miniCart) {
          console.log('Overlay clicked!'); // Debug
          this.hideMiniCart();
        }
      });
    }

    // Observer les changements du localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'cartLs') {
        this.cart = JSON.parse(e.newValue) || [];
        this.updateCounter();
        this.updateMiniCart();
      }
    });

    // Observer les changements manuels du cart
    window.addEventListener('cartUpdated', () => {
      this.cart = JSON.parse(localStorage.getItem('cartLs')) || [];
      this.updateCounter();
      this.updateMiniCart();
      this.animateCounter();
    });

    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.miniCart && this.miniCart.classList.contains('show')) {
        console.log('Escape pressed, hiding mini cart...');
        this.hideMiniCart();
      }
    });
  }

  showMiniCart() {
    console.log('Showing mini cart...'); // Debug
    if (this.miniCart) {
      this.miniCart.classList.add('show');
      // Empêcher le scroll du body sur mobile
      document.body.style.overflow = 'hidden';
      console.log('Mini cart shown, classes:', this.miniCart.classList.toString()); // Debug
    } else {
      console.log('Mini cart element not found!'); // Debug
    }
  }

  hideMiniCart() {
    console.log('Hiding mini cart...'); // Debug
    if (this.miniCart) {
      this.miniCart.classList.remove('show');
      // Rétablir le scroll du body
      document.body.style.overflow = '';
      console.log('Mini cart hidden'); // Debug
    }
  }

  toggleMiniCart() {
    console.log('Toggling mini cart...'); // Debug
    if (this.miniCart) {
      if (this.miniCart.classList.contains('show')) {
        console.log('Mini cart is visible, hiding...'); // Debug
        this.hideMiniCart();
      } else {
        console.log('Mini cart is hidden, showing...'); // Debug
        this.showMiniCart();
      }
    } else {
      console.log('Mini cart element not found in toggle!'); // Debug
    }
  }

  // Méthodes publiques pour contrôler le mini-cart
  show() {
    this.showMiniCart();
  }

  hide() {
    this.hideMiniCart();
  }

  setupCartEvents(cartContainer, cartLink) {
    if (!cartContainer || !cartLink) return;

    // Supprimer les event listeners existants
    const newCartLink = cartLink.cloneNode(true);
    cartLink.parentNode.replaceChild(newCartLink, cartLink);

    const isMobile = () => window.innerWidth <= 768;

    if (isMobile()) {
      // Sur mobile : utiliser click pour toggle le mini-cart
      newCartLink.addEventListener('click', (e) => {
        e.preventDefault(); // Empêcher la navigation vers cart.html
        this.toggleMiniCart();
      });

      // Fermer en cliquant sur l'overlay
      if (this.miniCart) {
        this.miniCart.addEventListener('click', (e) => {
          if (e.target === this.miniCart) {
            console.log('Overlay clicked, hiding mini cart...');
            this.hideMiniCart();
          }
        });

        // Empêcher la fermeture quand on clique dans le conteneur
        const container = this.miniCart.querySelector('.mini-cart-container');
        if (container) {
          container.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
      }
    } else {
      // Sur desktop : utiliser hover comme avant
      cartContainer.addEventListener('mouseenter', () => this.showMiniCart());
      cartContainer.addEventListener('mouseleave', (e) => {
        setTimeout(() => {
          if (!cartContainer.matches(':hover')) {
            this.hideMiniCart();
          }
        }, 300);
      });
    }
  }

  updateCounter() {
    if (!this.cartCounter) return;

    const totalItems = this.cart.reduce((total, item) => total + parseInt(item.quantity), 0);

    this.cartCounter.textContent = totalItems;

    if (totalItems > 0) {
      this.cartCounter.classList.remove('hidden');
    } else {
      this.cartCounter.classList.add('hidden');
    }
  }

  animateCounter() {
    if (this.cartCounter) {
      this.cartCounter.style.animation = 'none';
      this.cartCounter.offsetHeight; // Trigger reflow
      this.cartCounter.style.animation = 'pulse 0.6s ease-in-out';
    }
  }

  async updateMiniCart() {
    if (!this.miniCartItems || !this.miniCartTotal) return;

    if (this.cart.length === 0) {
      this.miniCartItems.innerHTML = '<p class="empty-cart-message">Votre panier est vide</p>';
      this.miniCartTotal.textContent = '0,00 €';
      return;
    }

    // Fetch product details for cart items
    const cartWithDetails = await this.fetchCartDetails();

    // Render cart items
    this.miniCartItems.innerHTML = cartWithDetails.map(item => `
      <div class="mini-cart-item">
        <img src="${item.imageUrl}" alt="${item.altTxt}" class="mini-cart-item-image">
        <div class="mini-cart-item-info">
          <p class="mini-cart-item-name">${item.name}</p>
          <p class="mini-cart-item-details">${item.color} - Qté: ${item.quantity}</p>
        </div>
        <div class="mini-cart-item-price">${((item.price / 100) * item.quantity).toFixed(2)} €</div>
      </div>
    `).join('');

    // Update total
    const total = cartWithDetails.reduce((sum, item) => sum + ((item.price / 100) * item.quantity), 0);
    this.miniCartTotal.textContent = `${total.toFixed(2)} €`;
  }

  async fetchCartDetails() {
    const cartWithDetails = [];

    for (const cartItem of this.cart) {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${cartItem.id}`);
        const productData = await response.json();

        cartWithDetails.push({
          ...productData,
          color: cartItem.color,
          quantity: cartItem.quantity
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit:', error);
      }
    }

    return cartWithDetails;
  }

  // Méthode pour ajouter un produit (appelée depuis d'autres fichiers)
  static addToCart(productData) {
    // Dispatch event pour notifier le changement
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Afficher notification
    NotificationManager.show(`${productData.name} ajouté au panier !`, 'success');
  }
}

/**
 * LOADING MANAGER
 * Gestion des états de chargement et skeleton screens
 */
class LoadingManager {
  static showSkeleton() {
    const skeleton = document.getElementById('loadingSkeleton');
    const itemsContainer = document.getElementById('items');

    if (skeleton) skeleton.style.display = 'grid';
    if (itemsContainer) itemsContainer.style.display = 'none';
  }

  static hideSkeleton() {
    const skeleton = document.getElementById('loadingSkeleton');
    const itemsContainer = document.getElementById('items');

    if (skeleton) skeleton.style.display = 'none';
    if (itemsContainer) itemsContainer.style.display = 'grid';
  }

  static addLoadingState(element) {
    if (element) {
      element.classList.add('loading');
    }
  }

  static removeLoadingState(element) {
    if (element) {
      element.classList.remove('loading');
    }
  }
}

/**
 * NOTIFICATION MANAGER
 * Système de notifications toast
 */
class NotificationManager {
  static show(message, type = 'info', duration = 3000) {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">
        <span class="notification__icon">${this.getIcon(type)}</span>
        <span class="notification__message">${message}</span>
      </div>
      <button class="notification__close">&times;</button>
    `;

    // Ajouter les styles si pas encore fait
    this.addNotificationStyles();

    // Ajouter au DOM
    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => notification.classList.add('notification--show'), 100);

    // Fermeture automatique
    const autoClose = setTimeout(() => this.close(notification), duration);

    // Fermeture manuelle
    notification.querySelector('.notification__close').addEventListener('click', () => {
      clearTimeout(autoClose);
      this.close(notification);
    });
  }

  static close(notification) {
    notification.classList.remove('notification--show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  static getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  static addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        border-left: 4px solid var(--primary-color);
        padding: var(--space-md);
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        min-width: 300px;
        transform: translateX(400px);
        transition: transform var(--transition-normal);
        z-index: 10000;
      }

      .notification--show {
        transform: translateX(0);
      }

      .notification--success {
        border-left-color: var(--success-color);
      }

      .notification--error {
        border-left-color: var(--danger-color);
      }

      .notification--warning {
        border-left-color: var(--warning-color);
      }

      .notification__content {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex: 1;
      }

      .notification__icon {
        font-size: 1.2rem;
      }

      .notification__message {
        color: var(--dark-gray);
        font-weight: 500;
      }

      .notification__close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--medium-gray);
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
      }

      .notification__close:hover {
        background: var(--light-gray);
        color: var(--dark-gray);
      }
    `;
    document.head.appendChild(styles);
  }
}

/**
 * LAZY LOADING MANAGER
 * Gestion du lazy loading des images
 */
class LazyLoadManager {
  static init() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  static makeImageLazy(img, src) {
    img.dataset.src = src;
    img.classList.add('lazy');
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  window.miniCartManager = new MiniCartManager();
  LazyLoadManager.init();
});

// Export pour utilisation dans d'autres fichiers
window.MiniCartManager = MiniCartManager;
window.LoadingManager = LoadingManager;
window.NotificationManager = NotificationManager;
window.LazyLoadManager = LazyLoadManager; 