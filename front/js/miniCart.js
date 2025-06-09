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

    this.init();
  }

  init() {
    this.updateCounter();
    this.updateMiniCart();
    this.bindEvents();
  }

  bindEvents() {
    // Toggle mini-cart au hover
    const cartContainer = document.querySelector('.cart-container');
    if (cartContainer) {
      cartContainer.addEventListener('mouseenter', () => this.showMiniCart());
      cartContainer.addEventListener('mouseleave', (e) => {
        // Délai pour permettre de naviguer dans le mini-cart
        setTimeout(() => {
          if (!cartContainer.matches(':hover')) {
            this.hideMiniCart();
          }
        }, 300);
      });
    }

    // Fermer le mini-cart
    if (this.miniCartClose) {
      this.miniCartClose.addEventListener('click', () => this.hideMiniCart());
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
  }

  showMiniCart() {
    if (this.miniCart) {
      this.miniCart.classList.add('show');
    }
  }

  hideMiniCart() {
    if (this.miniCart) {
      this.miniCart.classList.remove('show');
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
        <div class="mini-cart-item-price">${(item.price * item.quantity).toFixed(2)} €</div>
      </div>
    `).join('');

    // Update total
    const total = cartWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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