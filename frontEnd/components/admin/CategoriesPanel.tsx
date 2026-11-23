import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, Category, categoryIdOf } from '../../services/api';
import { Modal, useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { useAdmin } from './AdminDashboard';
import { EmptyState, PageHeader, SingleImageUpload, Skeleton } from './ui';

const CategoriesPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshStats } = useAdmin();

  useEffect(() => {
    Promise.all([api.getCategoryList(), api.admin.projects()])
      .then(([cats, projects]) => {
        setCategories(cats);
        const map: Record<string, number> = {};
        projects.forEach((p) => {
          const id = categoryIdOf(p);
          map[id] = (map[id] || 0) + 1;
        });
        setCounts(map);
      })
      .catch((e) => toast.error(e))
      .finally(() => setLoading(false));
  }, [toast]);

  const openEditor = (cat: Category | null) => {
    setEditing(cat);
    setName(cat?.name || '');
    setImage(cat?.image || '');
    setOpen(true);
  };

  useEffect(() => {
    if (params.get('new') === '1') {
      openEditor(null);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return toast.error('اكتب اسم الفئة');
    if (!image) return toast.error('ارفع صورة للفئة');
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.admin.updateCategory({ ...editing, name: name.trim(), image });
        setCategories((list) => list.map((c) => (c._id === editing._id ? updated : c)));
        toast.success('تم تحديث الفئة');
      } else {
        const created = await api.admin.createCategory({ name: name.trim(), image });
        setCategories((list) => [created, ...list]);
        toast.success('تمت إضافة الفئة');
      }
      setOpen(false);
      refreshStats();
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat: Category) => {
    const count = counts[cat._id] || 0;
    if (count > 0) {
      toast.error(`لا يمكن حذف "${cat.name}" لأنها تحتوي على ${count} عمل. انقل الأعمال لفئة أخرى أولاً.`);
      return;
    }
    if (!(await confirm({ title: `حذف فئة "${cat.name}"؟`, confirmText: 'حذف', danger: true }))) return;
    try {
      await api.admin.deleteCategory(cat._id);
      setCategories((list) => list.filter((c) => c._id !== cat._id));
      toast.success('تم حذف الفئة');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <PageHeader
        title="الفئات"
        description="الفئات تنظّم أعمالك في المعرض."
        actions={<button onClick={() => openEditor(null)} className="btn-primary"><Plus size={16} /> فئة جديدة</button>}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={<FolderTree size={26} />} title="لا توجد فئات" description="أضف أول فئة (مثل: أبواب، ديكورات جدارية، لوحات)." action={<button onClick={() => openEditor(null)} className="btn-primary"><Plus size={16} /> إضافة فئة</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card group overflow-hidden">
              <button onClick={() => openEditor(cat)} className="block aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={cat.image} alt={cat.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              </button>
              <div className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{cat.name}</div>
                  <div className="text-xs text-gray-500">{counts[cat._id] || 0} عمل</div>
                </div>
                <button onClick={() => openEditor(cat)} className="btn-icon" aria-label="تعديل"><Pencil size={16} /></button>
                <button onClick={() => remove(cat)} className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" aria-label="حذف"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        size="sm"
        title={editing ? 'تعديل الفئة' : 'فئة جديدة'}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-secondary">إلغاء</button>
            <button onClick={() => save()} disabled={saving} className="btn-primary min-w-[90px]">{saving ? <Loader2 size={16} className="animate-spin" /> : 'حفظ'}</button>
          </div>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="cat-name">اسم الفئة</label>
            <input id="cat-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>
          <SingleImageUpload
            value={image}
            label="صورة الفئة"
            onUpload={async (file) => {
              try {
                setImage(await api.admin.uploadImage(file));
              } catch (error) {
                toast.error(error);
              }
            }}
          />
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPanel;
