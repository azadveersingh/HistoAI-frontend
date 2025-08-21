export interface Event {
  EventName?: string;
  Description?: string;
  Participants?: string[];
  Location?: string;
  Place?: string;
  StartDate?: string;
  EndDate?: string;
  KeyDetails?: string;
  Day?: string;
  Month?: string;
  Year?: string;
  GeneralComments?: string;
  pdfUrl?: string;
}

export interface StructuredDataEntry {
  SourceURL: string;
  Result: string; // JSON string of { Events: Event[] }
}

export interface TableRow {
  SrNo: number;
  SourceURL: string;
  pdfUrl?: string;
  _bookName?: string; // Separator for multiple books
  [key: string]: any; // Dynamic event fields
}

export interface Book {
  book_id: string;
  filename: string;
  fileUrl?: string;
  structured_data_path?: string;
  selected_llm?: string;
}

export interface Collection {
  collection_id: string;
  bookIds: string[];
}