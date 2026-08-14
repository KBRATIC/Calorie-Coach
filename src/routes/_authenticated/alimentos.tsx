import { unitFor } from "@/lib/nutrition";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Salad,
  Search,
  Utensils,
} from "lucide-react";
import { BASE_FOODS, type BaseFood } from "@/data/baseFoods";
import { fetchCustomFoods } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      { property: "og:title", content: "Tabela de alimentos — KcalTrack" },
      {
        property: "og:description",
        content: "Mais de 1.100 alimentos com calorias por 100 g e por porção.",
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

export function FoodsPage() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [page, setPage] = useState(0);

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

  function SortHeader({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort.key === sortKey;
    return (
      <button
        type="button"
        onClick={() => toggleSort(sortKey)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Base de referência</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Tabela de alimentos</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Todos os alimentos disponíveis no app, com calorias por 100 g, medida caseira e o valor
          estimado por porção. Filtre por categoria, ordene por densidade calórica e planeje o dia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
          <div key={stat.label} className="panel p-5">
            <stat.icon className="size-5 text-primary" />
            <p className="stat-number mt-3 text-3xl">
              {stat.value}
              {stat.suffix}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-3 border-b border-border/70 p-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="relative min-w-0 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar alimento…"
              className="pl-9"
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
            <SelectTrigger className="w-full sm:w-64" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">
                  <SortHeader label="Alimento" sortKey="name" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortHeader label="Categoria" sortKey="category" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Medida
                  </span>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader label="Kcal / 100 g" sortKey="kcalPer100g" />
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  <SortHeader label="Kcal / porção" sortKey="portion" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((food) => {
                const tone = densityTone(food.kcalPer100g);
                return (
                  <TableRow key={food.id} className="border-border/60">
                    <TableCell className="max-w-[320px]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium">{food.name}</span>
                        {food.custom && (
                          <Badge variant="outline" className="shrink-0 border-primary/40 text-primary">
                            meu
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {food.category}
                      </span>
                      {(food.proteinPer100g !== undefined || food.carbsPer100g !== undefined || food.fatPer100g !== undefined) && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium text-muted-foreground">
                          {food.proteinPer100g !== undefined && (
                            <span className="flex items-center gap-1">
                              <div className="size-1.5 rounded-full bg-[oklch(0.6_0.15_250)]" />
                              P: {food.proteinPer100g}g
                            </span>
                          )}
                          {food.carbsPer100g !== undefined && (
                            <span className="flex items-center gap-1">
                              <div className="size-1.5 rounded-full bg-[oklch(0.7_0.18_70)]" />
                              C: {food.carbsPer100g}g
                            </span>
                          )}
                          {food.fatPer100g !== undefined && (
                            <span className="flex items-center gap-1">
                              <div className="size-1.5 rounded-full bg-[oklch(0.6_0.2_15)]" />
                              G: {food.fatPer100g}g
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {food.category}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {food.measure} · {Math.round(food.measureGrams)} {unitFor(food)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="stat-number">{Math.round(food.kcalPer100g)}</span>
                        <Badge variant="outline" className={`shrink-0 ${tone.className}`}>
                          {tone.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-right lg:table-cell">
                      <span className="stat-number text-muted-foreground">
                        {Math.round(portionKcal(food))}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!visible.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum alimento encontrado para esse filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-4">
          <p className="text-xs text-muted-foreground">
            {rows.length ? current * PAGE_SIZE + 1 : 0}–
            {Math.min((current + 1) * PAGE_SIZE, rows.length)} de {rows.length} alimentos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              {current + 1} / {pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Valores de referência baseados na Tabela de Calorias EndocrinoSaude. Podem variar conforme
        preparo e marca.
      </p>
    </div>
  );
}
