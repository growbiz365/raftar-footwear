import { useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCartOpen,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotal,
} from '../../store/slices/cartSlice';
import api from '../../services/api';
import { openWhatsApp, embedImageInText, messageAlreadySent, markWhatsAppSent } from '../../utils/whatsapp';

const WHATSAPP = '923338788861';

const inputCls =
  'w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0b4f86]';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const [orderMode, setOrderMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildWhatsAppMessage = () => {
    const lines = items.map((item, i) => {
      const pack = item.packSize || 1;
      return `${i + 1}. ${item.name} | Color: ${item.selectedColor || '-'} | Size: ${item.selectedSize || '-'} | Pack: ${pack} pairs × qty ${item.quantity} | Rs ${(item.price * item.quantity).toLocaleString()}`;
    });
    return `Hi Raftar Footwear!\nI want to place a wholesale order:\n\n${lines.join(
      '\n'
    )}\n\n*Total: Rs ${total.toLocaleString()}*\n\nPlease confirm availability & delivery.`;
  };

  const itemImage = (item) =>
    item.image ||
    (item.colorVariants || []).find((v) => v.name === item.selectedColor)?.image ||
    item.images?.[0] ||
    '';

  const sendWhatsApp = () => {
    const base = buildWhatsAppMessage();
    const withImgs = `${base}\n\nProduct images (tap to view, send separately):\n${items
      .map((item, i) => `${i + 1}. ${item.name}\n${embedImageInText(itemImage(item))}`)
      .join('\n\n')}`;
    const body = messageAlreadySent(WHATSAPP, base) ? base : withImgs;
    markWhatsAppSent(WHATSAPP, base);
    openWhatsApp(WHATSAPP, body);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please fill in at least your name and phone number.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        items: items.map((item) => {
          const variant = (item.colorVariants || []).find((v) => v.name === item.selectedColor);
          const image = item.image || variant?.image || item.images?.[0] || '';
          return {
            productId: item._id,
            name: item.name,
            qty: item.quantity,
            price: item.price,
            image,
            color: item.selectedColor,
            size: item.selectedSize,
            packSize: item.packSize || 1,
          };
        }),
        total,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
      });
      setPlaced(true);
      dispatch(clearCart());
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    setPlaced(false);
    setOrderMode(false);
    setForm({ name: '', email: '', phone: '', address: '' });
    dispatch(setCartOpen(false));
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={() => dispatch(setCartOpen(false))} />
      <div className="absolute bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 w-full sm:max-w-md h-[88%] sm:h-full bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none">
        <div className="mx-auto sm:hidden w-10 h-1.5 bg-gray-200 rounded-full mt-2 mb-1" />
        <div className="flex items-center justify-between p-5 pb-3 border-b">
          <h2 className="text-lg font-medium">Cart ({items.length})</h2>
          <button onClick={() => dispatch(setCartOpen(false))} className="p-1" aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            placed ? null : (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button onClick={() => dispatch(setCartOpen(false))} className="text-sm underline text-[#0b4f86]">
                  Continue Shopping
                </button>
              </div>
            )
          ) : (
            <div className="space-y-5">
              {items.map((item) => {
                const variant = (item.colorVariants || []).find((v) => v.name === item.selectedColor);
                const src = item.image || variant?.image || item.images?.[0] || '';
                return (
                <div
                  key={`${item._id}-${item.selectedColor}-${item.selectedSize}-${item.packSize || 1}`}
                  className="flex gap-4"
                >
                  <img
                    src={src}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                    {item.selectedColor && (
                      <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                    )}
                    {item.selectedSize && (
                      <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                    )}
                    {item.packSize > 1 && (
                      <p className="text-xs text-[#0b4f86] font-medium">Pack: {item.packSize} pairs</p>
                    )}
                    <p className="text-sm font-semibold mt-1 text-[#0b4f86]">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item._id,
                                color: item.selectedColor,
                                size: item.selectedSize,
                                packSize: item.packSize,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          className="p-1.5"
                          aria-label="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item._id,
                                color: item.selectedColor,
                                size: item.selectedSize,
                                packSize: item.packSize,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          className="p-1.5"
                          aria-label="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          dispatch(
                            removeFromCart({
                              id: item._id,
                              color: item.selectedColor,
                              size: item.selectedSize,
                              packSize: item.packSize,
                            })
                          )
                        }
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        aria-label="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {(placed || items.length > 0) && (
          <div className="border-t p-5 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5">
            {placed ? (
              <div className="text-center py-6">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-3" />
                <p className="font-semibold text-lg">Order Placed!</p>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Thank you! Your order has been placed. It will be delivered within a few days. For more details, please contact us on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    `Hi Raftar Footwear! I just placed an order for Rs ${total.toLocaleString()}. Kindly confirm the delivery details.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3 rounded-xl text-sm font-semibold transition mb-3"
                >
                  <MessageCircle size={18} /> Contact on WhatsApp
                </a>
                <button
                  onClick={finish}
                  className="w-full border border-[#0b4f86] text-[#0b4f86] py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                >
                  Done
                </button>
              </div>
            ) : orderMode ? (
              <form onSubmit={placeOrder} className="space-y-3">
                <p className="text-sm font-semibold">Your Details</p>
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input
                    className={inputCls}
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="03xx xxxxxxx"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email (optional)</label>
                  <input
                    className={inputCls}
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Address (optional)</label>
                  <textarea
                    className={inputCls}
                    value={form.address}
                    onChange={set('address')}
                    rows={2}
                    placeholder="City, area, shop name…"
                  />
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span>Total</span>
                  <span className="text-[#0b4f86]">Rs {total.toLocaleString()}</span>
                </div>
                {error && <p className="text-xs text-rose-500">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Placing order…
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderMode(false);
                    setError('');
                  }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
                >
                  ← Back
                </button>
              </form>
            ) : (
              <>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-[#0b4f86]">Rs {total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">Wholesale order · Confirm via WhatsApp</p>
                <button
                  type="button"
                  onClick={sendWhatsApp}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-xl font-semibold transition"
                >
                  <MessageCircle size={18} /> Order on WhatsApp
                </button>
                <button
                  onClick={() => setOrderMode(true)}
                  className="w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3 rounded-xl text-sm font-semibold transition"
                >
                  Place Order Manually
                </button>
                <button
                  onClick={() => dispatch(setCartOpen(false))}
                  className="w-full border py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="w-full text-xs text-gray-400 hover:text-rose-500 py-1"
                >
                  Clear cart
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}