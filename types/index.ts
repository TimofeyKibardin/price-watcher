export type PriceHistoryItem = {
  price: number;
  date: Date;
};

export type User = {
  email: string;
};

export type Product = {
  _id?: string;
  url: string;
  marketplaceType: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: string;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  users?: User[];
  articleNumber: string;
  sellerName: string;
};

export type NotificationType =
  | "WELCOME"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};