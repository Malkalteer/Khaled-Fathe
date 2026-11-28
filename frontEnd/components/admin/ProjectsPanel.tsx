import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Flame, GripVertical, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api, Category, Project, categoryIdOf, categoryIdsOf, inCategory } from '../../services/api';
import { useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { useAdmin } from './AdminDashboard';
import ProjectEditor from './ProjectEditor';
import { EmptyState, ListSkeleton, PageHeader, Stars, Switch } from './ui';

type Visibility = 'all' | 'visible' | 'hidden' | 'best';

const ProjectsPanel: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('all');
  const [editing, setEditing] = useState<Project | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshStats } = useAdmin();

  useEffect(() => {
    Promise.all([api.admin.projects(), api.getCategoryList()])
      .then(([p, c]) => {
        setProjects(p);
        setCategories(c);
      })
      .catch((e) => toast.error(e))
      .finally(() => setLoading(false));
  }, [toast]);

  // فتح نموذج الإضافة مباشرة من "نظرة عامة"
  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null);
      setEditorOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtering = Boolean(query.trim() || catFilter || visibility !== 'all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!q || p.title.toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q) || (p.material || '').toLowerCase().includes(q)) &&
        (!catFilter || inCategory(p, catFilter)) &&
        (visibility === 'all' || (visibility === 'best' ? p.bestSeller : visibility === 'hidden' ? p.hidden : !p.hidden))
    );
  }, [projects, query, catFilter, visibility]);

  const catName = (p: Project) => categoryIdsOf(p).map((id) => categories.find((c) => c._id === id)?.name).filter(Boolean).join('، ') || '—';

  const persistOrder = async (next: Project[]) => {
    const previous = projects;
    setProjects(next);
    try {
      await api.admin.reorderProjects(next.map((p) => p._id));
      toast.success('تم حفظ الترتيب');
    } catch (error) {
      setProjects(previous);
      toast.error(error);
    }
  };

  const move = (id: string, targetId: string) => {
    if (id === targetId) return;
    const next = [...projects];
    const from = next.findIndex((p) => p._id === id);
    const to = next.findIndex((p) => p._id === targetId);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  const moveBy = (id: string, delta: number) => {
    const idx = projects.findIndex((p) => p._id === id);
    const target = projects[idx + delta];
    if (target) move(id, target._id);
  };

  const toggleHidden = async (project: Project) => {
    setBusyId(project._id);
    try {
      await api.admin.setProjectHidden(project._id, !project.hidden);
      setProjects((list) => list.map((p) => (p._id === project._id ? { ...p, hidden: !project.hidden } : p)));
      toast.success(project.hidden ? 'أصبح العمل ظاهراً للزوار' : 'تم إخفاء العمل عن الزوار');
      refreshStats();
    } catch (error) {
      toast.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const toggleBestSeller = async (project: Project) => {
    setBusyId(project._id);
    try {
      await api.admin.setProjectBestSeller(project._id, !project.bestSeller);
      setProjects((list) => list.map((p) => (p._id === project._id ? { ...p, bestSeller: !project.bestSeller } : p)));
      toast.success(project.bestSeller ? 'أُزيل من «الأكثر مبيعاً»' : 'أُضيف إلى «الأكثر مبيعاً» في الصفحة الرئيسية');
    } catch (error) {
      toast.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (project: Project) => {
    const ok = await confirm({
      title: `حذف "${project.title}"؟`,
      message: 'سيُحذف العمل نهائياً مع تقييماته. يمكنك بدلاً من ذلك إخفاؤه فقط.',
      confirmText: 'حذف نهائي',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.admin.deleteProject(project._id);
      setProjects((list) => list.filter((p) => p._id !== project._id));
      toast.success('تم حذف العمل');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  const onSaved = (saved: Project, isNew: boolean) => {
    setEditorOpen(false);
    const withCat = { ...saved, category: categories.find((c) => c._id === categoryIdOf(saved)) || saved.category, categories: categoryIdsOf(saved) };
    setProjects((list) => (isNew ? [withCat, ...list] : list.map((p) => (p._id === saved._id ? { ...p, ...withCat } : p))));
    refreshStats();
  };

  const openEditor = (p: Project | null) => {
    setEditing(p);
    setEditorOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="الأعمال"
        description="أضف وعدّل منتجاتك، رتّبها بالسحب، اختر «الأكثر مبيعاً» 🔥، وأخفِ ما لا تريد عرضه دون حذفه."
        actions={
          <button onClick={() => openEditor(null)} className="btn-primary" disabled={categories.length === 0} title={categories.length === 0 ? 'أضف فئة أولاً' : undefined}>
            <Plus size={16} /> عمل جديد
          </button>
        }
      />

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="field pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالعنوان أو الكود أو المادة..." aria-label="بحث" />
        </label>
        <select className="field md:w-48" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="الفئة">
          <option value="">كل الفئات</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex rounded-lg bg-gray-100 p-1 text-sm dark:bg-gray-800" role="tablist">
          {(['all', 'visible', 'hidden', 'best'] as Visibility[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={visibility === v}
              onClick={() => setVisibility(v)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${visibility === v ? 'bg-white shadow dark:bg-gray-700' : 'text-gray-500'}`}
            >
              {v === 'all' ? 'الكل' : v === 'visible' ? 'ظاهر' : v === 'hidden' ? 'مخفي' : 'الأكثر مبيعاً'}
            </button>
          ))}
        </div>
      </div>

      {filtering && filtered.length > 0 && (
        <p className="mb-3 text-xs text-gray-500">💡 أزل الفلاتر لتتمكن من إعادة الترتيب بالسحب.</p>
      )}

      {loading ? (
        <ListSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState icon={<Package size={26} />} title="أضف فئة أولاً" description="كل عمل يجب أن ينتمي إلى فئة." action={<Link to="/admin/categories?new=1" className="btn-primary">إضافة فئة</Link>} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={26} />}
          title={filtering ? 'لا توجد نتائج' : 'لا توجد أعمال بعد'}
          description={filtering ? 'جرّب تغيير البحث أو الفلاتر.' : 'ابدأ بإضافة أول عمل لعرضه في المعرض.'}
          action={!filtering && <button onClick={() => openEditor(null)} className="btn-primary"><Plus size={16} /> إضافة عمل</button>}
        />
      ) : (
        <ul className="card divide-y divide-gray-100 overflow-hidden dark:divide-gray-800">
          {filtered.map((p, i) => (
            <li
              key={p._id}
              draggable={!filtering}
              onDragStart={() => setDragId(p._id)}
              onDragEnd={() => { setDragId(null); setOverId(null); }}
              onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverId(p._id); } }}
              onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, p._id); setDragId(null); setOverId(null); }}
              className={`flex items-center gap-3 p-3 transition sm:gap-4 sm:p-4 ${dragId === p._id ? 'opacity-40' : ''} ${
                overId === p._id && dragId !== p._id ? 'bg-primary-50 dark:bg-primary-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {!filtering && (
                <div className="hidden flex-col items-center sm:flex">
                  <button onClick={() => moveBy(p._id, -1)} disabled={i === 0} className="btn-icon !h-6 !w-6" aria-label="تحريك للأعلى"><ChevronUp size={14} /></button>
                  <GripVertical size={16} className="cursor-grab text-gray-300" />
                  <button onClick={() => moveBy(p._id, 1)} disabled={i === filtered.length - 1} className="btn-icon !h-6 !w-6" aria-label="تحريك للأسفل"><ChevronDown size={14} /></button>
                </div>
              )}
              <button onClick={() => openEditor(p)} className="relative h-16 w-[52px] shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 sm:h-20 sm:w-16">
                {p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" className={`h-full w-full object-cover ${p.hidden ? 'grayscale opacity-60' : ''}`} />}
                {p.images?.length > 1 && <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[10px] text-white">{p.images.length}</span>}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditor(p)} className="truncate text-right font-semibold hover:text-primary-600">{p.title}</button>
                  {p.hidden && <span className="badge bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"><EyeOff size={11} /> مخفي</span>}
                  {p.bestSeller && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><Flame size={11} /> الأكثر مبيعاً</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {p.code ? <span className="font-mono font-semibold text-gray-600 dark:text-gray-300" dir="ltr">#{p.code}</span> : <span className="font-semibold text-red-500">بدون كود</span>}
                  <span>{catName(p)}</span>
                  {Number(p.price) > 0 && <span>{Number(p.price).toFixed(2)} $</span>}
                  {p.votes ? <span className="inline-flex items-center gap-1"><Stars value={p.averageRating || 0} size={11} /> ({p.votes})</span> : <span>بدون تقييم</span>}
                  {p.favorites ? <span>❤ {p.favorites}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => toggleBestSeller(p)}
                  disabled={busyId === p._id}
                  aria-pressed={Boolean(p.bestSeller)}
                  className={`btn-icon ${p.bestSeller ? '!bg-amber-100 !text-amber-600 dark:!bg-amber-950 dark:!text-amber-300' : ''}`}
                  title={p.bestSeller ? 'إزالة من الأكثر مبيعاً' : 'إضافة إلى الأكثر مبيعاً'}
                  aria-label={p.bestSeller ? 'إزالة من الأكثر مبيعاً' : 'إضافة إلى الأكثر مبيعاً'}
                >
                  <Flame size={16} className={p.bestSeller ? 'fill-current' : ''} />
                </button>
                <Switch checked={!p.hidden} onChange={() => toggleHidden(p)} disabled={busyId === p._id} label={p.hidden ? 'إظهار في الموقع' : 'إخفاء من الموقع'} />
                <span className="hidden w-10 text-xs text-gray-500 md:inline">{p.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</span>
                <a href={`/project/${p._id}`} target="_blank" rel="noopener noreferrer" className="btn-icon hidden sm:inline-flex" aria-label="عرض في الموقع" title="عرض في الموقع"><ExternalLink size={16} /></a>
                <button onClick={() => openEditor(p)} className="btn-icon" aria-label="تعديل" title="تعديل"><Pencil size={16} /></button>
                <button onClick={() => remove(p)} className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" aria-label="حذف" title="حذف"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProjectEditor open={editorOpen} project={editing} categories={categories} onClose={() => setEditorOpen(false)} onSaved={onSaved} />
    </div>
  );
};

export default ProjectsPanel;
