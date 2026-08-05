export type DiffStatus = 'added' | 'modified' | 'removed' | 'unchanged';

export interface WireframeNodeData {
  id: string;
  name: string;
  props: string[];
  events: string[];
  children: WireframeNodeData[];
  isFallback?: boolean;
  rawLines?: string[];
  diffStatus?: DiffStatus;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export interface ContentItem {
  id: string;
  type: 'paragraph' | 'bullet' | 'table' | 'code' | 'fallback';
  text?: string;
  table?: TableContent;
  diffStatus?: DiffStatus;
}

export interface ScreenSection {
  id: string;
  title: string;
  level: number; // 1: #, 2: ##, 3: ###
  nodes: WireframeNodeData[];
  contentItems: ContentItem[];
  rawMarkdown: string;
  isFallback?: boolean;
  diffStatus?: DiffStatus;
  children?: ScreenSection[];
}

export interface ParsedPRD {
  title: string;
  screens: ScreenSection[];
  rootScreens: ScreenSection[];
  rawMarkdown: string;
}

export interface DiffResult {
  hasChanges: boolean;
  summaryText: string;
  addedScreens: string[];
  modifiedScreens: string[];
  removedScreens: string[];
  addedComponents: string[];
  modifiedComponents: string[];
  removedComponents: string[];
  parsedCurrent: ParsedPRD;
  parsedPrevious?: ParsedPRD;
}

export interface LineChangeItem {
  lineNo: number;
  type: 'added' | 'modified' | 'removed';
  before: string;
  after: string;
}

export interface ChangeLogItem {
  id: string;
  timestamp: string;
  summaryText: string;
  lineChanges: LineChangeItem[];
  addedScreens: string[];
  modifiedScreens: string[];
  removedScreens: string[];
  addedComponents: string[];
  modifiedComponents: string[];
  removedComponents: string[];
}

export interface SamplePRDOption {
  id: string;
  title: string;
  badge: string;
  description: string;
  markdown: string;
}
