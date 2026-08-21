import { unitFor } from "@/lib/nutrition";
import { useMemo, useState } from "react";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { Route as AuthRoute } from "@/routes/_authenticated/route";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Salad,
  Search,
  Utensils,
  Plus,
  Trash2
} from "lucide-react";
import { BASE_FOODS, type BaseFood } from "@/data/baseFoods";
import { fetchCustomFoods, addCustomFood, deleteCustomFood } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export const Route = createFileRoute("/_authenticated/alimentos")({
  head: () => ({
    meta: [
      { title: "Tabela de alimentos — KcalTrack" },
      {
        name: "description",
        content:
          "Consulte a tabela completa de alimentos com calorias por 100 g, medida caseira e categoria.",
      },
    ],
  }),
  component: FoodsPage,
});

type SortKey = "name" | "category" | "kcalPer100g" | "portion";
type Row = BaseFood & { custom?: boolean };

const PAGE_SIZE = 25;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function portionKcal(food: Row) {
  return (food.kcalPer100g * food.measureGrams) / 100;
}

function densityTone(kcal: number) {
  if (kcal < 100) return { label: "Leve", className: "border-success/40 text-success" };
  if (kcal < 250) return { label: "Moderado", className: "border-warning/40 text-warning" };
  return { label: "Calórico", className: "border-destructive/40 text-destructive" };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 5 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 250, damping: 15 } }
};

export function FoodsPage() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const location = useLocation();
  const isActive = location.pathname.startsWith("/alimentos");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(0);
  const { user } = AuthRoute.useRouteContext();

  const customQuery = useQuery({ queryKey: ["custom-foods"], queryFn: fetchCustomFoods });

  const allFoods = useMemo<Row[]>(() => {
    const custom: Row[] = (customQuery.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category ?? "Meus alimentos",
      kcalPer100g: Number(f.kcal_per_100g),
      proteinPer100g: f.protein_per_100g !== null ? Number(f.protein_per_100g) : undefined,
      carbsPer100g: f.carbs_per_100g !== null ? Number(f.carbs_per_100g) : undefined,
      fatPer100g: f.fat_per_100g !== null ? Number(f.fat_per_100g) : undefined,
      measure: f.default_measure ?? "1 porção",
      measureGrams: Number(f.default_grams ?? 100),
      custom: true,
    }));
    return [...custom, ...BASE_FOODS];
  }, [customQuery.data]);

  const categories = useMemo(
    () => Array.from(new Set(allFoods.map((f) => f.category))).sort((a, b) => a.localeCompare(b)),
    [allFoods],
  );

  const rows = useMemo(() => {
    const q = normalize(term.trim());
    const words = q ? q.split(/\s+/) : [];

    const filtered = allFoods.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!words.length) return true;
      const haystack = normalize(`${f.name} ${f.category}`);
      return words.every((w) => haystack.includes(w));
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "kcalPer100g":
          return (a.kcalPer100g - b.kcalPer100g) * dir;
        case "portion":
          return (portionKcal(a) - portionKcal(b)) * dir;
        case "category":
          return a.category.localeCompare(b.category) * dir || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });
  }, [allFoods, term, category, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const avg = rows.length
    ? rows.reduce((sum, f) => sum + f.kcalPer100g, 0) / rows.length
    : 0;

  function toggleSort(key: SortKey) {
    setPage(0);
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  function SortButton({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort.key === sortKey;
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
          active ? "bg-primary/10 text-primary border border-primary/20" : "bg-white/[0.03] text-muted-foreground border border-transparent hover:bg-white/[0.06] hover:text-foreground"
        }`}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : null}
      </button>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate={isActive ? "show" : "hidden"} className="space-y-6 pb-10">
      <motion.div variants={itemVariants} className="text-center sm:text-left">
        <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Base de dados</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Alimentos</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-muted-foreground leading-relaxed">
          Navegue por nossa base completa. Filtre por categoria, ordene por densidade calórica e encontre a refeição perfeita.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Utensils, label: "Alimentos listados", value: rows.length, suffix: "" },
          { icon: Salad, label: "Categorias", value: categories.length, suffix: "" },
          {
            icon: Flame,
            label: "Média por 100 g",
            value: Math.round(avg),
            suffix: " kcal",
          },
        ].map((stat) => (
          <motion.div variants={itemVariants} key={stat.label} className="bento-card p-6 flex flex-col transition-transform hover:scale-[1.02]">
            <stat.icon className="size-6 text-primary" />
            <p className="stat-number mt-4 text-3xl font-medium tracking-tight text-foreground drop-shadow-sm">
              {stat.value}
              <span className="text-xl text-muted-foreground font-normal ml-1">{stat.suffix}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {user && (
        <motion.div variants={itemVariants}>
          <CustomFoods userId={user.id} />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bento-card overflow-hidden">
        {/* Filter & Search Header */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-surface border-b border-border">
          <div className="relative w-full flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar alimento…"
              className="w-full bg-surface border border-border hover:bg-surface-strong focus:border-primary/50 transition-colors rounded-2xl h-14 pl-12 pr-4 text-base outline-none shadow-inner"
              aria-label="Buscar alimento"
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full md:w-64 h-14 rounded-2xl bg-surface border border-border text-base shadow-inner">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-surface max-h-72">
              <SelectItem value="all" className="rounded-xl my-1">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="rounded-xl my-1">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sorting Pills */}
        <div className="w-full px-4 sm:px-6 py-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mr-2 shrink-0">Ordenar:</span>
            <SortButton label="Nome" sortKey="name" />
            <SortButton label="Categoria" sortKey="category" />
            <SortButton label="Calorias (100g)" sortKey="kcalPer100g" />
            <SortButton label="Calorias (Porção)" sortKey="portion" />
          </div>
        </div>

        {/* Rich List View */}
        <div className="p-4 sm:p-6 bg-black/10">
          <motion.div 
            key={page}
            className="grid gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } }
            }}
          >
            {visible.map((food) => {
              const tone = densityTone(food.kcalPer100g);
              const hasMacros = food.proteinPer100g !== undefined || food.carbsPer100g !== undefined || food.fatPer100g !== undefined;
              
              return (
                  <motion.div 
                    key={food.id} 
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
                    }}
                    className="bento-card hover:bg-surface-strong rounded-[24px] p-4 sm:p-5 transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between group w-full max-w-full overflow-hidden"
                  >
                  <div className="flex-1 min-w-0 w-full sm:w-auto max-w-full">
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground/90 truncate flex-1 min-w-0">{food.name}</h3>
                      {food.custom && (
                        <Badge variant="outline" className="shrink-0 border-primary/30 text-primary bg-primary/5 text-[10px] px-2 py-0">
                          Meu alimento
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                      <span className="px-2 py-1 rounded-lg bg-surface border border-border">{food.category}</span>
                      <span>•</span>
                      <span>{food.measure} <span className="opacity-60">({Math.round(food.measureGrams)} {unitFor(food)})</span></span>
                    </div>

                    {hasMacros && (
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-bold tracking-widest uppercase">
                        {food.proteinPer100g !== undefined && (
                          <span className="flex items-center gap-1.5 bg-[oklch(0.6_0.15_250)]/10 text-[oklch(0.7_0.15_250)] px-2.5 py-1 rounded-full border border-[oklch(0.6_0.15_250)]/20 whitespace-nowrap">
                            P <span className="text-foreground ml-0.5">{food.proteinPer100g}g</span>
                          </span>
                        )}
                        {food.carbsPer100g !== undefined && (
                          <span className="flex items-center gap-1.5 bg-[oklch(0.7_0.18_70)]/10 text-[oklch(0.8_0.18_70)] px-2.5 py-1 rounded-full border border-[oklch(0.7_0.18_70)]/20 whitespace-nowrap">
                            C <span className="text-foreground ml-0.5">{food.carbsPer100g}g</span>
                          </span>
                        )}
                        {food.fatPer100g !== undefined && (
                          <span className="flex items-center gap-1.5 bg-[oklch(0.6_0.2_15)]/10 text-[oklch(0.7_0.2_15)] px-2.5 py-1 rounded-full border border-[oklch(0.6_0.2_15)]/20 whitespace-nowrap">
                            G <span className="text-foreground ml-0.5">{food.fatPer100g}g</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t border-white/5 sm:border-0 mt-2 sm:mt-0 shrink-0 w-full sm:w-auto min-w-0 max-w-full overflow-hidden">
                    <div className="flex items-baseline gap-1.5 shrink-0 min-w-0">
                      <span className="stat-number text-3xl font-medium text-foreground tracking-tight">{Math.round(food.kcalPer100g)}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">kcal/100g</span>
                    </div>
                    <Badge variant="outline" className={`shrink-0 border-transparent bg-white/5 uppercase tracking-widest text-[9px] font-bold px-2 py-0.5 ${tone.className}`}>
                      {tone.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {!visible.length && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Search className="size-6 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium">Nenhum alimento encontrado</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Tente ajustar seus filtros ou realizar uma nova busca.</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-surface-strong border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-xl h-10 border-border hover:bg-surface shadow-sm active:scale-95 transition-all"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <span className="text-sm font-medium text-muted-foreground bg-surface px-4 py-1.5 rounded-full border border-border shadow-inner">
            Página {page + 1} de {pageCount}
          </span>
          <Button
            variant="outline"
            className="rounded-xl h-10 border-border hover:bg-surface shadow-sm active:scale-95 transition-all"
            disabled={page >= pageCount - 1 || pageCount === 0}
            onClick={() => setPage(page + 1)}
          >
            Próxima <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Valores de referência baseados na Tabela de Calorias EndocrinoSaude. Podem variar conforme
        preparo e marca.
      </p>
    </motion.div>
  );
}

function CustomFoods({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: foods } = useQuery({ queryKey: ["customFoods"], queryFn: fetchCustomFoods });
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [unit, setUnit] = useState<"g" | "ml">("g");

  const create = useMutation({
    mutationFn: () =>
      addCustomFood({
        user_id: userId,
        name: name.trim(),
        kcal_per_100g: Number(kcal),
        default_measure: unit === "ml" ? "1 copo" : "1 porção",
        default_grams: unit === "ml" ? 200 : 100,
        unit,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customFoods"] });
      setName("");
      setKcal("");
      toast.success("Alimento cadastrado");
    },
    onError: (e: Error) => toast.error("Erro ao cadastrar", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: deleteCustomFood,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customFoods"] }),
  });

  return (
    <div className="bento-card p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Meus alimentos</h2>
        <p className="text-[15px] text-muted-foreground/80 mt-1">
          Cadastre itens que não estão na base de mais de 1.100 alimentos.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_170px_auto] bg-surface p-2 rounded-[28px] border border-border">
        <div className="relative">
          <label htmlFor="custom-name" className="sr-only">Nome</label>
          <Input id="custom-name" name="custom-name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent border-border rounded-2xl h-12 w-full" />
        </div>
        <div className="flex rounded-2xl border border-border p-1 bg-surface-strong">
          {(["g", "ml"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`flex-1 rounded-xl py-1.5 text-[13px] font-medium transition-all ${
                unit === u ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {u === "g" ? "Sólido (g)" : "Líquido (ml)"}
            </button>
          ))}
        </div>
        <div className="relative">
          <label htmlFor="custom-kcal" className="sr-only">Calorias</label>
          <Input
            id="custom-kcal"
            name="custom-kcal"
            placeholder={`kcal / 100 ${unit}`}
            type="number"
            value={kcal}
            onChange={(e) => setKcal(e.target.value)}
            className="bg-transparent border-border rounded-2xl h-12 w-full"
          />
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={!name.trim() || !Number(kcal) || create.isPending}
          className="rounded-2xl h-12 px-8 active:scale-[0.98] transition-transform"
        >
          Cadastrar
        </Button>
      </div>
      {(foods ?? []).length > 0 && (
        <ul className="divide-y divide-border bg-surface rounded-[24px] border border-border p-2 mt-4">
          {foods!.map((f) => (
            <li key={f.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors">
              <span className="flex-1 truncate text-[15px] font-medium">{f.name}</span>
              <span className="stat-number text-base">
                {Math.round(Number(f.kcal_per_100g))} <span className="text-sm font-normal text-muted-foreground">kcal/100{f.unit === "ml" ? "ml" : "g"}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover ${f.name}`}
                onClick={() => remove.mutate(f.id)}
                className="size-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

