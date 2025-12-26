export interface BookData {
  id: string;
  name: string;
  description: string;
  current_page: number;
  page_count: number;
  score?: number;
  is_favorite: boolean;
  is_open: boolean;
  time_spent: number;
  completed_at?: number;
  last_time_opened?: number;
  text_highlights: TextHighlight[];
  file_size: number;
  book_path: string;
  thumbnail_path: string;
  progress: number;
}

export class Book implements BookData {
  id: string = "";
  name: string = "";
  description: string = "";
  current_page: number = 0;
  page_count: number = 0;
  score?: number = 0;
  is_favorite: boolean = false;
  is_open: boolean = false;
  time_spent: number = 0;
  completed_at?: number;
  last_time_opened: number = 0;
  text_highlights: TextHighlight[] = [];
  file_size: number = 0;
  book_path = "";
  thumbnail_path = "";
  progress: number = 0;

  constructor(props: BookData) {
    Object.assign(this, props);
    this.setCurrentPage(props.current_page);
  }

  setCurrentPage(page_number: number) {
    this.current_page = page_number;
    this.adjustProgress();
  }

  adjustProgress() {
    this.progress = Number(
      (100 * (this.current_page / this.page_count)).toFixed(1)
    );
  }
}

class Duration {
  secs: number = 0;
  nanos: number = 0;
}

interface TextHighlightData {
  page_number: number;
  line_number: number;
  start_pos: number;
  length: number;
  color: TextHighlightColor;
}

class TextHighlight implements TextHighlightData {
  page_number: number = 0;
  line_number: number = 0;
  start_pos: number = 0;
  length: number = 0;
  color: TextHighlightColor = 0;
  constructor(props: TextHighlight) {
    Object.assign(this, props);
  }
}

enum TextHighlightColor {
  RED,
  BLUE,
  CYAN,
  GREEN,
  GRAY,
  PINK,
  YELLOW,
  PURPLE,
}
