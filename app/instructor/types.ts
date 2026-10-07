export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  avgRating: number;
  createdAt: string;
  _count: { enrollments: number; sections: number };
}

export interface Account {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type Tab =
  'dashboard' | 'courses' | 'students' | 'analytics' | 'reviews' | 'settings' | 'create';
export type CourseFilter = 'all' | 'published' | 'draft';
