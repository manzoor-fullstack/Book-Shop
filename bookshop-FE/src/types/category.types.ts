export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
}

export interface CategoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface CategoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}
