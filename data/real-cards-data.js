// data/real-cards-data.js

const REAL_CARDS_DATA = [
  // Данные из вашего файла import-cards-from-csv.js
  {
    ipName: "ИП Крутоусов",
    region: "Астрахань",
    corpCard: "*3420",
    personalCard: "*7367",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП Храмова",
    region: "",
    corpCard: "*5049",
    personalCard: "*4455",
    corpStatus: "В ПВЗ Наливайко", 
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Янгалышева А.",
    region: "",
    corpCard: "*2468",
    personalCard: "*9647",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП НАЛИВАЙКО",
    region: "",
    corpCard: "*8098",
    personalCard: "-",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП КАШИРИН В.Г.",
    region: "",
    corpCard: "*7969",
    personalCard: "-",
    corpStatus: "в регионе", 
    personalStatus: ""
  },
  {
    ipName: "ИП Астанови Араз",
    region: "Бурятия (УЛАН-УДЭ)",
    corpCard: "*7651",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП Пинегин",
    region: "",
    corpCard: "",
    personalCard: "*3475",
    corpStatus: "",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Ровда А.Ю.",
    region: "",
    corpCard: "*8829",
    personalCard: "*5833",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП ИЛЬЕНКО",
    region: "",
    corpCard: "*8325",
    personalCard: "*5865",
    corpStatus: "в регионе",
    personalStatus: "Перевыпустить"
  },
  {
// Обновляем данные карт с балансами
{
    ipName: "ИП Бондаренко Л.И.",
    region: "Курган", 
    corpCard: "*7254",
    personalCard: "*5664",
    corpStatus: "в регионе",
    personalStatus: "в регионе",
    balance: 15000
},
{
    ipName: "ИП Бобков",
    region: "",
    corpCard: "*1381", 
    personalCard: "*2911",
    corpStatus: "В ПВЗ Овсейко",
    personalStatus: "в регионе",
    balance: 12000
},
  // ... добавить балансы для всех карт
  {
    ipName: "ИП Дюльгер",
    region: "",
    corpCard: "*9895",
    personalCard: "--",
    corpStatus: "в регионе", 
    personalStatus: ""
  },
  {
    ipName: "ИП Федчук",
    region: "",
    corpCard: "*9967",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП КАРБЫШЕВ",
    region: "",
    corpCard: "*2937",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП ОВСЕЙКО",
    region: "",
    corpCard: "*1946",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП РЯБЕНКО И.И",
    region: "",
    corpCard: "-",
    personalCard: "*6532",
    personalCard: "*7611",
    corpStatus: "",
    personalStatus: "",
    personalStatus: ""
  },
  {
    ipName: "ИП Ибрагимов Ш",
    region: "Калмыкия (ЭЛИСТА)",
    corpCard: "*5109",
    personalCard: "*7068",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Никифорова",
    region: "",
    corpCard: "*4821",
    personalCard: "*5341",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Ярославцев Г.В.",
    region: "",
    corpCard: "*7570",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП Иванов",
    region: "Мордовия (САРАНСК)",
    corpCard: "*7184",
    personalCard: "*3487",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП Коротких",
    region: "",
    corpCard: "*8701",
    personalCard: "--",
    corpStatus: "в регионе",
    personalStatus: ""
  },
  {
    ipName: "ИП Яковлева",
    region: "",
    corpCard: "*4679",
    personalCard: "*0952",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Бадалов",
    region: "Удмуртия (ИЖЕВСК)",
    corpCard: "",
    personalCard: "*8406",
    corpStatus: "",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Емельянов Г. И.",
    region: "",
    corpCard: "*4454",
    personalCard: "*7289",
    corpStatus: "В ПВЗ Леонгард",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Леонгард",
    region: "",
    corpCard: "*1749",
    personalCard: "*9648",
    corpStatus: "В ПВЗ Емельянов",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Саинова",
    region: "",
    corpCard: "*5313",
    personalCard: "*0628",
    corpStatus: "В ПВЗ Шефер",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Самсонов А.Д.",
    region: "",
    corpCard: "*5995",
    personalCard: "*3500",
    corpStatus: "в регионе",
    personalStatus: "в регионе"
  },
  {
    ipName: "ИП Шефер",
    region: "",
    corpCard: "*1767",
    personalCard: "",
    corpStatus: "в регионе",
    personalStatus: ""
  }
];

// Делаем данные доступными для других файлов
if (typeof module !== 'undefined' && module.exports) {
  module.exports = REAL_CARDS_DATA;
} else {
  window.REAL_CARDS_DATA = REAL_CARDS_DATA;
}