import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { api, Category, Project, ProjectInput, categoryIdOf } from '../../services/api';
import { Modal, useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { Switch } from './ui';

interface Props {
  open: boolean;
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (project: Project, isNew: boolean) => void;
}

type FormState = {
  title: string;
  category: string;
  images: string[];
  price: string;
  material: string;
  dimensions: string;
  details: string;
  description: string;
  hidden: boolean;
  bestSeller: boolean;
};

const empty: FormState = { title: '', category: '', images: [], price: '', material: '', dimensions: '', details: '', description: '', hidden: false, bestSeller: false };

const fromProject = (p: Project | null): FormState =>
  p
    ? {
        title: p.title,
        category: categoryIdOf(p),
        images: p.images || [],
        price: p.price ? String(p.price) : '',
        material: p.material || '',
        dimensions: p.dimensions || '',
        details: (p.details || []).join('\n'),
        description: p.description || '',
        hidden: Boolean(p.hidden),
        bestSeller: Boolean(p.bestSeller),
      }
    : empty;

const ProjectEditor: React.FC<Props> = ({ open, project, categories, onClose, onSaved }) => {
  const [form, setForm] = useState<FormState>(empty);
  const [initial, setInitial] = useState<FormState>(empty);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (!open) return;
    const state = fromProject(project);
    setForm(state);
    setInitial(state);
    setErrors({});
  }, [open, project]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const requestClose = async () => {
    if (uploading) return toast.info('انتظر حتى ينتهي رفع الصور');
    if (dirty && !(await confirm({ title: 'تجاهل التعديلات؟', message: 'لديك تغييرات لم تُحفظ.', confirmText: 'تجاهل', danger: true }))) return;
    onClose();
  };

  const uploadFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: الحجم أكبر من 10MB`);
          const url = await api.admin.uploadImage(file);
          setForm((f) => ({ ...f, images: [...f.images, url] }));
          setErrors((e) => ({ ...e, images: undefined }));
        } catch (error) {
          toast.error(error);
        } finally {
          setUploading((n) => n - 1);
        }
      })
    );
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length || from === to) return;
    const images = [...form.images];
    const [item] = images.splice(from, 1);
    images.splice(to, 0, item);
    set('images', images);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = 'العنوان مطلوب';
    if (!form.category) next.category = 'اختر فئة';
    if (form.images.length === 0) next.images = 'أضف صورة واحدة على الأقل';
    if (form.price && (Number.isNaN(Number(form.price)) || Number(form.price) < 0)) next.price = 'سعر غير صالح';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (uploading) return toast.info('انتظر حتى ينتهي رفع الصور');
    if (!validate()) return;
    const payload: ProjectInput = {
      title: form.title.trim(),
      category: form.category,
      images: form.images,
      price: Number(form.price) || 0,
      material: form.material.trim(),
      dimensions: form.dimensions.trim(),
      details: form.details.split('\n').map((l) => l.trim()).filter(Boolean),
      description: form.description.trim(),
      hidden: form.hidden,
      bestSeller: form.bestSeller,
    };
    setSaving(true);
    try {
      const saved = project ? await api.admin.updateProject(project._id, payload) : await api.admin.createProject(payload);
      toast.success(project ? 'تم حفظ التعديلات' : 'تمت إضافة العمل');
      onSaved(saved, !project);
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof FormState) => errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>;

  return (
    <Modal
      open={open}
      onClose={requestClose}
      side
      title={project ? 'تعديل العمل' : 'إضافة عمل جديد'}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!form.hidden} onChange={(v) => set('hidden', !v)} label="ظاهر في الموقع" />
              <span>{form.hidden ? 'مخفي عن الزوار' : 'ظاهر في الموقع'}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.bestSeller} onChange={(v) => set('bestSeller', v)} label="الأكثر مبيعاً" />
              <span>الأكثر مبيعاً</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={requestClose} className="btn-secondary">إلغاء</button>
            <button type="button" onClick={() => submit()} disabled={saving || uploading > 0} className="btn-primary min-w-[110px]">
              {saving ? <Loader2 size={16} className="animate-spin" /> : project ? 'حفظ' : 'إضافة'}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        {/* الصور */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <span className="field-label !mb-0">الصور <span className="text-xs font-normal text-gray-400">(الأولى هي صورة الغلاف — اسحب لإعادة الترتيب)</span></span>
            <span className="text-xs text-gray-400">{form.images.length}/20</span>
          </div>
          <div
            className={`grid grid-cols-3 gap-3 rounded-xl p-1 sm:grid-cols-4 ${dropActive ? 'ring-2 ring-primary-500' : ''}`}
            onDragOver={(e) => { if (dragIdx === null) { e.preventDefault(); setDropActive(true); } }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(e) => { if (dragIdx === null) { e.preventDefault(); setDropActive(false); uploadFiles(e.dataTransfer.files); } }}
          >
            {form.images.map((img, idx) => (
              <div
                key={img + idx}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragEnd={() => setDragIdx(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dragIdx !== null) moveImage(dragIdx, idx); setDragIdx(null); }}
                className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-gray-100 dark:bg-gray-800 ${
                  idx === 0 ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200 dark:border-gray-700'
                } ${dragIdx === idx ? 'opacity-40' : ''}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
                {idx === 0 && <span className="absolute right-1.5 top-1.5 rounded-md bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">الغلاف</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button type="button" onClick={() => moveImage(idx, idx - 1)} disabled={idx === 0} className="rounded bg-white/90 p-1 text-gray-700 disabled:opacity-40" aria-label="تقديم">
                    <ArrowRight size={14} />
                  </button>
                  {idx !== 0 && (
                    <button type="button" onClick={() => moveImage(idx, 0)} className="rounded bg-white/90 p-1 text-gray-700" aria-label="اجعلها الغلاف" title="اجعلها الغلاف">
                      <Star size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => moveImage(idx, idx + 1)} disabled={idx === form.images.length - 1} className="rounded bg-white/90 p-1 text-gray-700 disabled:opacity-40" aria-label="تأخير">
                    <ArrowLeft size={14} />
                  </button>
                  <button type="button" onClick={() => set('images', form.images.filter((_, i) => i !== idx))} className="rounded bg-red-600 p-1 text-white" aria-label="حذف الصورة">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <div key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-primary-400 bg-primary-50 dark:bg-primary-950/30">
                <Loader2 className="animate-spin text-primary-600" />
              </div>
            ))}
            {form.images.length + uploading < 20 && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-primary-400 hover:text-primary-600 dark:border-gray-700"
              >
                <ImagePlus size={24} />
                <span className="text-xs">إضافة صور</span>
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
          {fieldError('images')}
        </section>

        {/* المعلومات الأساسية */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="p-title">العنوان *</label>
            <input id="p-title" className="field" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={150} placeholder="مثال: باب خشب محفور CNC" />
            {fieldError('title')}
          </div>
          <div>
            <label className="field-label" htmlFor="p-cat">الفئة *</label>
            <select id="p-cat" className="field" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="" disabled>اختر فئة</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {fieldError('category')}
          </div>
          <div>
            <label className="field-label" htmlFor="p-price">السعر ($)</label>
            <input id="p-price" className="field" type="number" min="0" step="0.01" inputMode="decimal" dir="ltr" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="اتركه فارغاً = السعر عند الطلب" />
            {fieldError('price')}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="p-material">المادة المستخدمة</label>
            <input id="p-material" className="field" value={form.material} onChange={(e) => set('material', e.target.value)} maxLength={200} placeholder="MDF / Plywood / رخام / أكريليك" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="p-dim">الأبعاد <span className="text-xs font-normal text-gray-400">(كل سطر قيمة)</span></label>
            <textarea id="p-dim" className="field min-h-[110px]" dir="auto" value={form.dimensions} onChange={(e) => set('dimensions', e.target.value)} maxLength={1000} placeholder={'Width: 95 CM\nHeight: 200 CM'} />
          </div>
          <div>
            <label className="field-label" htmlFor="p-details">مواصفات إضافية <span className="text-xs font-normal text-gray-400">(كل سطر نقطة)</span></label>
            <textarea id="p-details" className="field min-h-[110px]" value={form.details} onChange={(e) => set('details', e.target.value)} placeholder={'دهان مقاوم للماء\nتسليم خلال أسبوع'} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="p-desc">الوصف</label>
            <textarea id="p-desc" className="field min-h-[110px]" value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={3000} />
            <div className="mt-1 text-left text-xs text-gray-400">{form.description.length}/3000</div>
          </div>
        </section>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default ProjectEditor;
