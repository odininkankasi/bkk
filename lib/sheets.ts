import fallbackBooks from "@/data/books_fallback.json";

export interface Book {
  sira_no: string;
  kitap_adi: string;
  yazar_adi: string;
  okundu: "Evet" | "Hayır";
  kitaplikta_var: "Evet" | "Hayır";
  puan: number | null;
  tarih_1?: string;
  tarih_2?: string;
  kapak_gorseli?: string;
  kisisel_yorum?: string;
  tanitim_yazisi?: string;
  cevirmen?: string;
  ozgun_adi?: string;
  sayfa_sayisi?: string;
  isbn?: string;
  basim_yili?: string;
  ithaki_yayin_yili?: string;
  slug: string;
}

export const SHEET_ID = "16X3KyJtwW5uO3fzco0XxaWBzkNYvDBfSDEymGn-MYQo";

export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return String(text || "")
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSheetDate(val: string): string {
  if (!val) return "";
  const match = val.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const y = match[1];
    const m = String(parseInt(match[2]) + 1).padStart(2, "0");
    const d = String(match[3]).padStart(2, "0");
    return `${d}.${m}.${y}`;
  }
  return val;
}

export async function getBooks(): Promise<Book[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // 1 dakika ISR önbellekleme
    });

    if (!res.ok) {
      console.warn("Failed to fetch live sheet, using fallback data.");
      return fallbackBooks as Book[];
    }

    const text = await res.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);

    if (!match) {
      return fallbackBooks as Book[];
    }

    const json = JSON.parse(match[1]);
    const cols = json.table.cols.map((c: { label?: string }) => (c.label || "").trim().toLowerCase());

    const books: Book[] = json.table.rows
      .filter((row: any) => row !== null)
      .map((row: any) => {
        const obj: any = {};
        cols.forEach((col: string, i: number) => {
          const cell = row.c && row.c[i] ? row.c[i] : null;
          let val = "";
          if (cell && cell.f != null) val = String(cell.f);
          else if (cell && cell.v != null) val = String(cell.v);

          if (col === "sira_no" || col === "no" || col === "sira") {
            obj.sira_no = val;
          } else if (col === "kitap_adi" || col === "kitap" || col === "baslik") {
            obj.kitap_adi = val;
          } else if (col === "yazar_adi" || col === "yazar") {
            obj.yazar_adi = val;
          } else if (col === "okundu") {
            obj.okundu = val === "TRUE" || val === "true" || val === "Evet" ? "Evet" : "Hayır";
          } else if (col === "kitaplikta_var" || col === "kitaplik" || col === "var") {
            obj.kitaplikta_var = val === "TRUE" || val === "true" || val === "Evet" ? "Evet" : "Hayır";
          } else if (col === "puan") {
            obj.puan = val ? parseInt(val) || null : null;
          } else if (col.includes("tarih 1") || col === "tarih1" || col === "baslangic") {
            obj.tarih_1 = formatSheetDate(val);
          } else if (col.includes("tarih 2") || col === "tarih2" || col === "bitis") {
            obj.tarih_2 = formatSheetDate(val);
          } else if (col.includes("kapak") || col.includes("gorsel") || col === "resim") {
            obj.kapak_gorseli = val;
          } else if (col.includes("yorum") || col.includes("not")) {
            obj.kisisel_yorum = val;
          } else if (col.includes("tanitim") || col.includes("aciklama") || col === "ozet") {
            obj.tanitim_yazisi = val;
          } else if (col.includes("cevirmen")) {
            obj.cevirmen = val;
          } else if (col.includes("ozgun")) {
            obj.ozgun_adi = val;
          }
        });

        const num = String(obj.sira_no || "0").padStart(2, "0");
        obj.slug = num + "-" + slugify(obj.kitap_adi);

        // Yerel Doğrulanmış Künye & HD Kapak Önceliği
        const fallbackMatch = (fallbackBooks as Book[]).find((fb) => String(fb.sira_no) == String(obj.sira_no));
        if (fallbackMatch) {
          if (fallbackMatch.kapak_gorseli) obj.kapak_gorseli = fallbackMatch.kapak_gorseli;
          if (!obj.cevirmen && fallbackMatch.cevirmen) obj.cevirmen = fallbackMatch.cevirmen;
          if (!obj.ozgun_adi && fallbackMatch.ozgun_adi) obj.ozgun_adi = fallbackMatch.ozgun_adi;
          if (!obj.sayfa_sayisi && fallbackMatch.sayfa_sayisi) obj.sayfa_sayisi = fallbackMatch.sayfa_sayisi;
          if (!obj.isbn && fallbackMatch.isbn) obj.isbn = fallbackMatch.isbn;
          if (!obj.tanitim_yazisi && fallbackMatch.tanitim_yazisi) obj.tanitim_yazisi = fallbackMatch.tanitim_yazisi;
          if (!obj.ithaki_yayin_yili && fallbackMatch.ithaki_yayin_yili) obj.ithaki_yayin_yili = fallbackMatch.ithaki_yayin_yili;
        }

        return obj as Book;
      })
      .filter((b: Book) => b.kitap_adi && b.kitap_adi.trim());

    return books.length > 0 ? books : (fallbackBooks as Book[]);
  } catch (error) {
    console.error("Sheets fetch error, fallback activated:", error);
    return fallbackBooks as Book[];
  }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const books = await getBooks();
  return (
    books.find((b) => b.slug === slug || b.sira_no === slug || String(b.sira_no).padStart(2, "0") === slug) || null
  );
}
