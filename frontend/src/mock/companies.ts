

export interface Company {
  id: number;
  account: string;
  name: string;
  logo?: string;
  address: string;
  maxUsers: number;
  expiredAt: Date | null;
  active: boolean;
  status: "active" | "inactive";
  numberOfUsers: number;

  users?: {
    id: number;
    email: string;
    full_name?: string;
    role: "admin" | "ca_user" | "member";
    status?: string;
  }[];
}

// Updated mock data with 15 entries
export const companiesMock: Company[] = [
  {
    id: 1,
    account: "zinza-group",
    name: "Zinza Group",
    logo: "https://picsum.photos/seed/zinza/100/100",
    address: "Tầng 3, Tòa nhà Lilama 10, Số 56 Tố Hữu, Trung Văn, Nam Từ Liêm, Hà Nội",
    maxUsers: 120,
    expiredAt: new Date("2025-12-31"),
    active: true,
    status: "active",
    numberOfUsers: 120,
  },
  {
    id: 2,
    account: "abc-tech",
    name: "ABC Tech",
    logo: "https://picsum.photos/seed/abctech/100/100",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    maxUsers: 50,
    expiredAt: new Date("2024-06-30"),
    active: false,
    status: "inactive",
    numberOfUsers: 50,
  },
  {
    id: 3,
    account: "def-solutions",
    name: "DEF Solutions",
    logo: "https://picsum.photos/seed/def/100/100",
    address: "456 Đường DEF, Quận Ba Đình, Hà Nội",
    maxUsers: 75,
    expiredAt: new Date("2025-09-15"),
    active: true,
    status: "active",
    numberOfUsers: 75,
  },
  {
    id: 4,
    account: "nextsoft",
    name: "NextSoft Co.",
    logo: "https://picsum.photos/seed/nextsoft/100/100",
    address: "22 Trần Hưng Đạo, TP. Huế",
    maxUsers: 60,
    expiredAt: new Date("2025-11-01"),
    active: true,
    status: "active",
    numberOfUsers: 60,
  },
  {
    id: 5,
    account: "futurehub",
    name: "FutureHub",
    logo: "https://picsum.photos/seed/future/100/100",
    address: "55 Nguyễn Huệ, TP.HCM",
    maxUsers: 8,
    expiredAt: new Date("2023-10-30"),
    active: false,
    status: "inactive",
    numberOfUsers: 8,
  },
  {
    id: 6,
    account: "skyline",
    name: "Skyline Systems",
    logo: "https://picsum.photos/seed/skyline/100/100",
    address: "101 Võ Văn Tần, Đà Nẵng",
    maxUsers: 72,
    expiredAt: new Date("2026-01-15"),
    active: true,
    status: "active",
    numberOfUsers: 72,
  },
  {
    id: 7,
    account: "nova-dynamics",
    name: "Nova Dynamics",
    logo: "https://picsum.photos/seed/nova/100/100",
    address: "67 Hai Bà Trưng, Hà Nội",
    maxUsers: 33,
    expiredAt: new Date("2025-03-10"),
    active: false,
    status: "inactive",
    numberOfUsers: 33,
  },
  {
    id: 8,
    account: "hyperdata",
    name: "HyperData Inc.",
    logo: "https://picsum.photos/seed/hyperdata/100/100g",
    address: "102 Trần Phú, TP.HCM",
    maxUsers: 97,
    expiredAt: new Date("2025-08-08"),
    active: true,
    status: "active",
    numberOfUsers: 97,
  },
  {
    id: 9,
    account: "techpulse",
    name: "TechPulse",
    logo: "https://picsum.photos/seed/techpulse/100/100",
    address: "33 Phạm Văn Đồng, Đà Nẵng",
    maxUsers: 54,
    expiredAt: new Date("2026-05-20"),
    active: true,
    status: "active",
    numberOfUsers: 54,
  },
  {
    id: 10,
    account: "greenbyte",
    name: "GreenByte",
    logo: "https://picsum.photos/seed/greenbyte/100/100",
    address: "21 Nguyễn Trãi, Cần Thơ",
    maxUsers: 21,
    expiredAt: new Date("2024-12-15"),
    active: false,
    status: "inactive",
    numberOfUsers: 21,
  },
  {
    id: 11,
    account: "eagle-core",
    name: "Eagle Core",
    logo: "https://picsum.photos/seed/eagle/100/100",
    address: "55 Trần Cao Vân, Huế",
    maxUsers: 40,
    expiredAt: new Date("2025-07-07"),
    active: true,
    status: "active",
    numberOfUsers: 40,
  },
  {
    id: 12,
    account: "quantumix",
    name: "Quantumix",
    logo: "https://quantumix.com/logo.png",
    address: "88 Trần Quang Khải, TP.HCM",
    maxUsers: 76,
    expiredAt: new Date("2026-02-02"),
    active: true,
    status: "active",
    numberOfUsers: 76,
  },
  {
    id: 13,
    account: "zenith-tech",
    name: "Zenith Tech",
    logo: "https://zenith.com/logo.png",
    address: "12 Nguyễn Văn Cừ, Hà Nội",
    maxUsers: 18,
    expiredAt: new Date("2023-09-09"),
    active: false,
    status: "inactive",
    numberOfUsers: 18,
  },
  {
    id: 14,
    account: "infobase",
    name: "Infobase Solutions",
    logo: "https://infobase.com/logo.png",
    address: "18 Phạm Ngọc Thạch, TP.HCM",
    maxUsers: 89,
    expiredAt: new Date("2025-10-25"),
    active: true,
    status: "active",
    numberOfUsers: 89,
  },
  {
    id: 15,
    account: "pixelwave",
    name: "PixelWave",
    logo: "https://pixelwave.com/logo.png",
    address: "77 Trần Hưng Đạo, Hà Nội",
    maxUsers: 12,
    expiredAt: new Date("2024-04-04"),
    active: false,
    status: "inactive",
    numberOfUsers: 12,
  },
];
export const getCompanyById = (id: number): Company | undefined => {
  return companiesMock.find((c) => c.id === id);
};