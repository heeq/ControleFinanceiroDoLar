import React, { useState } from 'react';
import PropTypes from 'prop-types';

/*
  CheckoutButton
  - Props:
    - total: number (cart total amount)
    - itemsCount: number (number of items in cart)
    - onCheckout: async function invoked when user clicks checkout
*/
export default function CheckoutButton({ total = 0, itemsCount = 0, onCheckout }) {
  const [loading, setLoading] = useState(false);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total);

  const handleClick = async (e) => {
    e.preventDefault();
    //if (loading || itemsCount === 0) return;

    //setLoading(true);
    try {
      if (onCheckout) {
        await onCheckout();
      }
    } catch (err) {
      // preserve error info for debugging
      // (Do not expose to UI here; caller can handle errors)
      // eslint-disable-next-line no-console
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

    //const disabled = loading || itemsCount === 0;
    const disabled = false;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={loading}
      className="checkout-button"
      title={itemsCount === 0 ? 'Add items to cart to enable checkout' : 'Proceed to checkout'}
      style={{
        padding: '0.5rem 1rem',
        background: disabled ? '#ccc' : '#0078d4',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {loading ? (
        <span aria-hidden="true">Processing…</span>
      ) : (
        <>
          <span>Checkout</span>
          <span style={{ opacity: 0.9 }}>({itemsCount})</span>
          <span style={{ fontWeight: 600 }}>{formattedTotal}</span>
        </>
      )}
    </button>
  );
}

CheckoutButton.propTypes = {
  total: PropTypes.number,
  itemsCount: PropTypes.number,
  onCheckout: PropTypes.func,
};