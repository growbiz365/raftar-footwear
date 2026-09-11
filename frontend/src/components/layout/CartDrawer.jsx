import { useRef, useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, CheckCircle2, Loader2, ArrowLeft, Banknote, Wallet, Landmark, Upload, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCartOpen,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotal,
} from '../../store/slices/cartSlice';
import api from '../../services/api';
import { useSettings } from '../../store/settingsContext';
import { openWhatsApp, embedImageInText, messageAlreadySent, markWhatsAppSent } from '../../utils/whatsapp';

const FALLBACK_CHECKOUT = {
  whatsapp: '923338788861',
  codEnabled: true,
  onlineEnabled: true,
  note: 'Please pay the exact order amount and share your transaction screenshot below.',
  accounts: [],
};

const inputCls =
  'w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0b4f86]';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const METHOD_LABEL = {
  cod: 'Cash on Delivery',
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
  other: 'Online Payment',
};

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { settings } = useSettings();
  const checkout = settings.checkout || FALLBACK_CHECKOUT;
  const whatsapp = checkout.whatsapp || FALLBACK_CHECKOUT.whatsapp;
  const accounts = (checkout.accounts || []).filter((a) => a.active);

  const { items, isOpen } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);

  const [step, setStep] = useState('cart');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [payMethod, setPayMethod] = useState(null);
  const [accountIdx, setAccountIdx] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCart = () => {
    setStep('cart');
    setPlaced(null);
  };

  const close = () => {
    dispatch(setCartOpen(false));
  };

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
    const body = messageAlreadySent(whatsapp, base) ? base : withImgs;
    markWhatsAppSent(whatsapp, base);
    openWhatsApp(whatsapp, body);
  };

  const validateDetails = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!form.phone.trim()) return 'Please enter your phone number.';
    if (!form.address.trim()) return 'Please enter your full delivery address.';
    return '';
  };

  const submitOrder = async () => {
    setError('');
    setSubmitting(true);
    const isOnline = payMethod === 'online';
    const account = isOnline ? accounts[accountIdx] : null;
    try {
      const { data } = await api.post('/orders', {
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
        payment: isOnline
          ? {
              method: account?.type || 'other',
              label: account?.label || METHOD_LABEL[account?.type] || 'Online Payment',
              accountNumber: account?.accountNumber || '',
              txnId: txnId.trim(),
              note: note.trim(),
              proofImage: proof,
            }
          : { method: 'cod' },
      });
      const order = data?.data || {};
      setPlaced({
        orderNo: order.orderNo || '',
        total,
        method: isOnline ? (account?.label || 'Online Payment') : 'Cash on Delivery',
      });
      setStep('placed');
      dispatch(clearCart());
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      const dataUrl = await compressImage(file);
      setProof(dataUrl);
    } catch {
      setError('Could not read the image. Please try another screenshot.');
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="absolute bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 w-full sm:max-w-md h-[92%] sm:h-full bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none">
        <div className="mx-auto sm:hidden w-10 h-1.5 bg-gray-200 rounded-full mt-2 mb-1" />
        <div className="flex items-center justify-between p-5 pb-3 border-b">
          <div className="flex items-center gap-2">
            {step !== 'cart' && !placed && (
              <button
                onClick={() => (step === 'details' ? openCart() : step === 'pay' ? setStep('details') : setStep('pay'))}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-800"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-medium">
              {placed ? 'Order Confirmed' : step === 'details' ? 'Delivery Details' : step === 'pay' ? 'Payment Method' : step === 'upload' ? 'Pay Online' : `Cart (${items.length})`}
            </h2>
          </div>
          <button onClick={close} className="p-1" aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 'placed' ? (
            <div className="text-center py-8">
              {placed?.orderNo && (
                <div className="inline-block bg-blue-50 text-[#0b4f86] font-bold text-sm px-3 py-1 rounded-full mb-4">
                  #{placed.orderNo}
                </div>
              )}
              <CheckCircle2 size={52} className="mx-auto text-emerald-500 mb-3" />
              <p className="font-semibold text-lg">Order Placed Successfully!</p>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                Thank you! Your order has been placed.
              </p>
              {placed?.method === 'Cash on Delivery' ? (
                <p className="text-xs text-gray-400 mb-6">
                  You will pay <b>Rs {placed.total.toLocaleString()}</b> in cash when your order is delivered.
                </p>
              ) : (
                <p className="text-xs text-gray-400 mb-6">
                  You selected <b>{placed.method}</b> for <b>Rs {placed.total.toLocaleString()}</b>. Our team will verify your payment screenshot and confirm your order shortly.
                </p>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button onClick={close} className="text-sm underline text-[#0b4f86]">
                Continue Shopping
              </button>
            </div>
          ) : step === 'details' ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Full name" />
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="03xx xxxxxxx" />
              </div>
              <div>
                <label className={labelCls}>Email (optional)</label>
                <input className={inputCls} value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelCls}>Full Delivery Address *</label>
                <textarea
                  className={inputCls}
                  value={form.address}
                  onChange={set('address')}
                  rows={3}
                  placeholder="City, area, street, shop name / house number…"
                />
              </div>
              <div className="flex justify-between text-sm font-semibold pt-1">
                <span>Order Total</span>
                <span className="text-[#0b4f86]">Rs {total.toLocaleString()}</span>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
          ) : step === 'pay' ? (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-gray-500">Choose how you want to pay for your order.</p>
              {checkout.codEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setPayMethod('cod');
                    setError('');
                    submitOrder();
                  }}
                  disabled={submitting}
                  className="w-full border-2 border-[#0b4f86] rounded-xl p-4 text-left hover:bg-blue-50/60 transition disabled:opacity-60 text-center"
                >
                  <Banknote size={26} className="mx-auto mb-2 text-[#0b4f86]" />
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 mt-1">Pay in cash when your order arrives</p>
                </button>
              )}
              {checkout.onlineEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setPayMethod('online');
                    setError('');
                    if (accountIdx === null) setAccountIdx(0);
                    setStep('upload');
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl p-4 text-left hover:border-[#0b4f86] transition text-center"
                >
                  <Wallet size={26} className="mx-auto mb-2 text-emerald-600" />
                  <p className="font-semibold">Online Payment</p>
                  <p className="text-xs text-gray-500 mt-1">EasyPaisa · JazzCash · Bank transfer</p>
                </button>
              )}
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
          ) : step === 'upload' ? (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-gray-500">
                Send <b className="text-[#0b4f86]">Rs {total.toLocaleString()}</b> to any account below, then upload your payment screenshot.
              </p>

              <div className="space-y-2">
                {accounts.map((acc, i) => (
                  <button
                    key={`${acc.type}-${i}`}
                    type="button"
                    onClick={() => setAccountIdx(i)}
                    className={`w-full border rounded-xl p-3 text-left flex items-start gap-3 transition ${
                      accountIdx === i ? 'border-[#0b4f86] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${accountIdx === i ? 'text-[#0b4f86]' : 'text-gray-400'}`}>
                      {acc.type === 'bank' ? <Landmark size={20} /> : <Wallet size={20} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{acc.label}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            accountIdx === i ? 'bg-[#0b4f86] border-[#0b4f86]' : 'border-gray-300'
                          }`}
                        >
                          {accountIdx === i && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {acc.bankName && `${acc.bankName} · `}
                        {acc.accountTitle}
                      </span>
                      <span className="block text-sm font-bold text-[#0b4f86] tracking-wide">{acc.accountNumber}</span>
                      {acc.note && <span className="block text-xs text-gray-400 mt-0.5">{acc.note}</span>}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className={labelCls}>Transaction ID (optional)</label>
                <input className={inputCls} value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="TRX / MWO / TID number" />
              </div>

              <div>
                <label className={labelCls}>Payment Proof (screenshot) *</label>
                {proof ? (
                  <div className="flex items-center gap-3 border rounded-xl p-3">
                    <img src={proof} alt="Payment proof" className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-emerald-600">Screenshot attached</p>
                      <p className="text-[11px] text-gray-400">We will verify it and confirm your order.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProof('')}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center text-gray-400 hover:border-[#0b4f86] hover:text-[#0b4f86] transition"
                  >
                    <Upload size={22} className="mb-1.5" />
                    <span className="text-xs">Tap to upload payment screenshot</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>

              <div>
                <label className={labelCls}>Note (optional)</label>
                <textarea className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything we should know…" />
              </div>

              {checkout.note && !error && (
                <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-2.5">{checkout.note}</p>
              )}
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
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
              <>
                {placed?.orderNo && (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      `Hi Raftar Footwear!\nI just placed order #${placed.orderNo} for Rs ${placed.total.toLocaleString()} via ${placed.method}. Kindly confirm my order and delivery details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3 rounded-xl text-sm font-semibold transition"
                  >
                    <MessageCircle size={18} /> Track order on WhatsApp
                  </a>
                )}
                <button
                  onClick={finish}
                  className="w-full border py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Done
                </button>
              </>
            ) : step === 'details' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const v = validateDetails();
                    if (v) {
                      setError(v);
                      return;
                    }
                    setError('');
                    setStep('pay');
                  }}
                  className="w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3.5 rounded-xl font-semibold transition"
                >
                  Continue to Payment
                </button>
              </>
            ) : step === 'pay' ? (
              <>{submitting && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Placing your order…
                </div>
              )}</>
            ) : step === 'upload' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (!proof) {
                      setError('Please upload your payment screenshot.');
                      return;
                    }
                    submitOrder();
                  }}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting order…
                    </>
                  ) : (
                    <>
                      <Camera size={18} /> I have sent the money &amp; uploaded proof
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-[#0b4f86]">Rs {total.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex items-center justify-center gap-2 w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3.5 rounded-xl font-semibold transition"
                >
                  <Banknote size={18} /> Checkout
                </button>
                <button
                  type="button"
                  onClick={sendWhatsApp}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3 rounded-xl text-sm font-semibold transition"
                >
                  <MessageCircle size={18} /> Order on WhatsApp
                </button>
                <button
                  onClick={close}
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

  function finish() {
    setPlaced(null);
    setStep('cart');
    setForm({ name: '', email: '', phone: '', address: '' });
    setPayMethod(null);
    setAccountIdx(null);
    setTxnId('');
    setNote('');
    setProof('');
    setError('');
    dispatch(setCartOpen(false));
  }
}