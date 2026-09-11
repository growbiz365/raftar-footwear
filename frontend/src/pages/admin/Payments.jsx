import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, X, Pencil, Wallet, Landmark, MessageCircle } from 'lucide-react';
import { useToast } from '../../components/admin/Toast';

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20 focus:border-[#0b4f86]';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const TYPE_BADGE = {
  easypaisa: { label: 'EasyPaisa', cls: 'bg-emerald-100 text-emerald-700' },
  jazzcash: { label: 'JazzCash', cls: 'bg-amber-100 text-amber-700' },
  bank: { label: 'Bank Transfer', cls: 'bg-blue-100 text-blue-700' },
  other: { label: 'Other', cls: 'bg-gray-100 text-gray-600' },
};

const detectType = (label) => {
  const l = (label || '').toLowerCase();
  if (l.includes('bank')) return 'bank';
  if (l.includes('jazz')) return 'jazzcash';
  if (l.includes('paisa')) return 'easypaisa';
  return 'other';
};

const noteFor = (type, label) => {
  if (type === 'bank') return 'Use the IBAN / account number above';
  if (type === 'easypaisa') return 'Send money to this EasyPaisa number';
  if (type === 'jazzcash') return 'Send money to this JazzCash number';
  return label ? `Pay to this ${label}` : '';
};

const emptyAccount = { label: '', accountTitle: '', accountNumber: '', bankName: '', active: true };

const DEFAULT_CHECKOUT = {
  whatsapp: '923338788861',
  codEnabled: true,
  onlineEnabled: true,
  accounts: [],
};

export default function AdminPayments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [checkout, setCheckout] = useState(DEFAULT_CHECKOUT);
  const [modal, setModal] = useState(null); // { index } or { index: null }
  const [draft, setDraft] = useState(emptyAccount);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const c = data?.data?.checkout || {};
        setCheckout({
          whatsapp: c.whatsapp || DEFAULT_CHECKOUT.whatsapp,
          codEnabled: c.codEnabled !== false,
          onlineEnabled: c.onlineEnabled !== false,
          accounts: Array.isArray(c.accounts) ? c.accounts : [],
        });
      } catch {
        toast('Could not load settings', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setC = (patch) => setCheckout((c) => ({ ...c, ...patch }));

  const openAdd = () => {
    setDraft(emptyAccount);
    setModal({ index: null });
  };

  const openEdit = (i) => {
    setDraft({ ...emptyAccount, ...checkout.accounts[i] });
    setModal({ index: i });
  };

  const saveAccount = () => {
    if (!draft.label.trim() && !draft.accountNumber.trim()) {
      toast('Enter at least a label or account number', 'error');
      return;
    }
    const type = detectType(draft.label);
    const clean = {
      label: draft.label,
      type,
      accountTitle: draft.accountTitle,
      accountNumber: draft.accountNumber,
      bankName: type === 'bank' ? draft.bankName : '',
      note: noteFor(type, draft.label),
      active: draft.active,
    };
    if (modal.index === null) {
      setC({ accounts: [...checkout.accounts, clean] });
    } else {
      setC({
        accounts: checkout.accounts.map((a, j) => (j === modal.index ? { ...a, ...clean } : a)),
      });
    }
    setModal(null);
    toast(modal.index === null ? 'Account added' : 'Account updated');
  };

  const toggleActive = (i, active) =>
    setC({ accounts: checkout.accounts.map((a, j) => (j === i ? { ...a, active } : a)) });

  const removeAccount = (i) => {
    setC({ accounts: checkout.accounts.filter((_, j) => j !== i) });
    toast('Account removed');
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    const accounts = checkout.accounts
      .filter((a) => a.label || a.accountNumber)
      .map((a) => {
        const type = detectType(a.label);
        return {
          label: a.label,
          type,
          accountTitle: a.accountTitle,
          accountNumber: a.accountNumber,
          bankName: type === 'bank' ? a.bankName : '',
          note: noteFor(type, a.label),
          active: a.active,
        };
      });
    try {
      await api.put('/admin/settings/checkout', {
        value: {
          whatsapp: checkout.whatsapp.replace(/\D/g, '') || DEFAULT_CHECKOUT.whatsapp,
          codEnabled: checkout.codEnabled,
          onlineEnabled: checkout.onlineEnabled,
          note: 'Please pay the exact order amount and share your transaction screenshot below to verify your payment.',
          accounts,
        },
      });
      setMsg('✓ Payment settings saved — customers see these instantly');
      toast('Payment settings saved');
    } catch (e) {
      setMsg(`✗ ${e?.response?.data?.message || 'Save failed — is the backend running?'}`);
      toast('Save failed', 'error');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const isBank = (draft) => detectType(draft.label) === 'bank';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payments &amp; Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">WhatsApp tracking number, payment options and bank / wallet accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#0b4f86] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 shadow-sm"
          >
            {saving ? 'Saving…' : 'Save all settings'}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-3 rounded-xl">
          {msg}
        </div>
      )}

      {/* WhatsApp + options */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>WhatsApp number (digits only)</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3">
              <MessageCircle size={16} className="text-[#25D366]" />
              <input
                className="w-full bg-transparent py-2 text-sm outline-none"
                value={checkout.whatsapp}
                onChange={(e) => setC({ whatsapp: e.target.value.replace(/[^\d+]/g, '') })}
                placeholder="923338788861"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Floating chat button + “Track order” link</p>
          </div>
          <div>
            <label className={labelCls}>Payment options</label>
            <div className="flex items-center gap-4 pt-1">
              <Toggle checked={checkout.codEnabled} onChange={(v) => setC({ codEnabled: v })} label="Cash on Delivery" />
              <Toggle checked={checkout.onlineEnabled} onChange={(v) => setC({ onlineEnabled: v })} label="Online Payment" />
            </div>
          </div>
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            Customers choose Cash on Delivery or Online Payment at checkout. Online buyers see your accounts and upload their payment screenshot.
          </div>
        </div>
      </div>

      {/* Accounts table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Account</th>
              <th className="text-left px-4 py-3 font-medium">Account Title</th>
              <th className="text-left px-4 py-3 font-medium">Number / IBAN</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Note</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checkout.accounts.map((a, i) => {
              const type = detectType(a.label);
              const badge = TYPE_BADGE[type] || TYPE_BADGE.other;
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                        {type === 'bank' ? <Landmark size={18} /> : <Wallet size={18} />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.label || 'Unnamed account'}</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{a.accountTitle || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 font-semibold text-[#0b4f86] whitespace-nowrap">{a.accountNumber || <span className="text-gray-300 font-normal">—</span>}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{noteFor(type, a.label) || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <Toggle checked={a.active} onChange={(v) => toggleActive(i, v)} label="" />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-gray-100 rounded mr-1" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => removeAccount(i)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {checkout.accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  No accounts yet
                  <button onClick={openAdd} className="block mx-auto mt-3 text-sm text-[#0b4f86] underline">
                    Add your first account
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-bold">{modal.index === null ? 'Add Account' : 'Edit Account'}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Display label *</label>
                <input
                  className={inputCls}
                  value={draft.label}
                  onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                  placeholder="EasyPaisa / JazzCash / Bank Transfer"
                />
                <p className="text-[11px] text-gray-400 mt-1">The type is detected from the label automatically.</p>
              </div>
              <div>
                <label className={labelCls}>Account title (name on the account)</label>
                <input
                  className={inputCls}
                  value={draft.accountTitle}
                  onChange={(e) => setDraft((d) => ({ ...d, accountTitle: e.target.value }))}
                  placeholder="Raftar Footwear"
                />
              </div>
              <div>
                <label className={labelCls}>Account number / IBAN</label>
                <input
                  className={inputCls}
                  value={draft.accountNumber}
                  onChange={(e) => setDraft((d) => ({ ...d, accountNumber: e.target.value }))}
                  placeholder="0300 1234567"
                />
              </div>
              {isBank(draft) && (
                <div>
                  <label className={labelCls}>Bank name</label>
                  <input
                    className={inputCls}
                    value={draft.bankName}
                    onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))}
                    placeholder="Meezan Bank"
                  />
                </div>
              )}
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#0b4f86]"
                />
                Active — show this account at checkout
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveAccount} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0b4f86] text-white hover:bg-[#083d6a]">
                {modal.index === null ? 'Add account' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-2.5"
      title={label}
    >
      {label && <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{label}</span>}
      <span className={`relative w-10 h-5.5 rounded-full transition ${checked ? 'bg-[#0b4f86]' : 'bg-gray-300'}`}
        style={{ height: 22, width: 40 }}>
        <span
          className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${checked ? 'left-[19px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}