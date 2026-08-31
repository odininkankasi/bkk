import { Book } from "./sheets";

export function exportBooksToCSV(books: Book[], filename = "ithaki-bilimkurgu-klasikleri-listesi.csv") {
  const headers = [
    "Sıra No",
    "Kitap Adı",
    "Yazar",
    "Okundu Durumu",
    "Kitaplık Durumu",
    "Puan",
    "Okuma Başlangıç",
    "Okuma Bitiş",
    "Kişisel Yorum",
  ];

  const rows = books.map((b) => [
    `"${b.sira_no || ""}"`,
    `"${(b.kitap_adi || "").replace(/"/g, '""')}"`,
    `"${(b.yazar_adi || "").replace(/"/g, '""')}"`,
    `"${b.okundu || "Hayır"}"`,
    `"${b.kitaplikta_var || "Hayır"}"`,
    `"${b.puan || ""}"`,
    `"${b.tarih_1 || ""}"`,
    `"${b.tarih_2 || ""}"`,
    `"${(b.kisisel_yorum || "").replace(/"/g, '""')}"`,
  ]);

  // UTF-8 BOM ekleyerek Excel'in Türkçe karakterleri düzgün açmasını sağlıyoruz
  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
