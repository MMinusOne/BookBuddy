interface BookData {
  id: string;
  name: string;
  description: string;
  page: number;
  page_count: number;
  progress: number;
  score?: number;
  is_favourte: boolean;
  is_open: boolean;
  time_spent: number;
  completed_at?: number;
  last_time_opened: number;
  text_highlights: TextHighlight[];
  file_size: number;
}

export class Book implements BookData {
  id: string = "";
  name: string = "";
  description: string = "";
  page: number = 0;
  page_count: number = 0;
  progress: number = 0;
  score?: number = 0;
  is_favourte: boolean = false;
  is_open: boolean = false;
  time_spent: number = 0;
  completed_at?: number;
  last_time_opened: number = 0;
  text_highlights: TextHighlight[] = [];
  file_size: number = 0;

  constructor(props: BookData) {
    Object.assign(this, props);
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
