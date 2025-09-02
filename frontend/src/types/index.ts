export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface ExcelData {
  id: string;
  fileName: string;
  uploadDate: string;
  data: (string | number)[][];
  headers: string[];
  rowCount: number;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  xAxis: string;
  yAxis: string;
  dataId: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}